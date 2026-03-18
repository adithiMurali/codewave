const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// State management for rooms
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    
    // Initialize room details if not present
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Map(),
        code: '// Write your code here\n',
        language: 'javascript'
      });
    }

    const room = rooms.get(roomId);
    
    // Check if user already exists (could be reconnection or duplicate name)
    let userAssignedName = username;
    let suffix = 1;
    while(Array.from(room.users.values()).some(u => u.username === userAssignedName)) {
      userAssignedName = `${username} (${suffix})`;
      suffix++;
    }

    room.users.set(socket.id, { username: userAssignedName, id: socket.id });

    // Send current state to newly joined user
    socket.emit('room-state', {
      code: room.code,
      language: room.language,
      users: Array.from(room.users.values())
    });

    // Notify others in room
    socket.to(roomId).emit('user-joined', {
      user: { username: userAssignedName, id: socket.id },
      users: Array.from(room.users.values())
    });

    // Handle code change
    socket.on('code-change', (newCode) => {
      room.code = newCode;
      socket.to(roomId).emit('code-change', newCode);
    });

    // Handle language change
    socket.on('language-change', (newLanguage) => {
      room.language = newLanguage;
      io.to(roomId).emit('language-change', newLanguage);
    });

    // Handle chat message
    socket.on('chat-message', (message) => {
      io.to(roomId).emit('chat-message', {
        id: Date.now().toString(),
        userId: socket.id,
        username: userAssignedName,
        text: message,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      const room = rooms.get(roomId);
      if (room) {
        const user = room.users.get(socket.id);
        room.users.delete(socket.id);
        
        socket.to(roomId).emit('user-left', {
          userId: socket.id,
          username: user?.username,
          users: Array.from(room.users.values())
        });

        // Cleanup empty rooms
        if (room.users.size === 0) {
          rooms.delete(roomId);
        }
      }
      console.log('User disconnected:', socket.id);
    });
  });
});

app.get('/', (req, res) => {
  res.send('CodeWave Server is running');
});

app.post('/execute', async (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: 'Language and code are required' });
  }

  const runId = uuidv4();
  const tempDir = path.join(__dirname, 'temp', runId);

  try {
    await fs.mkdir(tempDir, { recursive: true });
    
    let command;
    let fileName;
    
    if (language === 'javascript') {
      fileName = 'main.js';
      await fs.writeFile(path.join(tempDir, fileName), code);
      command = `node ${fileName}`;
    } else if (language === 'python') {
      fileName = 'main.py';
      await fs.writeFile(path.join(tempDir, fileName), code);
      command = `python ${fileName}`;
    } else if (language === 'cpp') {
      fileName = 'main.cpp';
      await fs.writeFile(path.join(tempDir, fileName), code);
      command = `g++ ${fileName} -o main.exe && .\\main.exe`;
    } else if (language === 'java') {
      // Find public class name if it exists to name the file correctly.
      // Or just assume 'Main.java' if code contains 'public class Main'
      // If code has different class name it will fail compilation unless file matches.
      // We will match the public class name.
      const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      fileName = classMatch ? `${classMatch[1]}.java` : 'Main.java';
      const className = fileName.replace('.java', '');
      
      await fs.writeFile(path.join(tempDir, fileName), code);
      command = `javac ${fileName} && java ${className}`;
    } else {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    exec(command, { cwd: tempDir, timeout: 5000 }, async (error, stdout, stderr) => {
      // Clean up async after sending response
      res.json({
        run: {
          stdout: stdout || '',
          stderr: stderr || '',
          code: error ? error.code || 1 : 0
        }
      });
      
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch(e) { console.error('Cleanup error:', e); }
    });

  } catch (err) {
    console.error('Execution error:', err);
    // Cleanup on early failure
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch(e) {}
    res.status(500).json({ error: 'Failed to prepare execution environment' });
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
