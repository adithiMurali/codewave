import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import CodeEditor from './components/Editor';
import Chat from './components/Chat';
import Presence from './components/Presence';

// Initialize socket connection
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

function Home() {
  const navigate = useNavigate();
  
  const createRoom = () => {
    const roomId = uuidv4();
    navigate(`/${roomId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f111a]">
      <div className="text-center p-8 bg-[#1a1d27] rounded-xl shadow-2xl border border-[#2e3345] max-w-md w-full">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">CodeWave</h1>
        <p className="text-gray-400 mb-8">Real-time Collaborative Code Editor</p>
        
        <button 
          onClick={createRoom}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/30"
        >
          Create New Room
        </button>
      </div>
    </div>
  );
}

function Room() {
  const { roomId } = useParams();
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('room-state', (state) => {
      setUsers(state.users);
    });

    socket.on('user-joined', ({ user, users }) => {
      setUsers(users);
    });

    socket.on('user-left', ({ userId, users }) => {
      setUsers(users);
    });

    socket.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('room-state');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('chat-message');
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('join-room', { roomId, username });
      setIsJoined(true);
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f111a]">
        <div className="p-8 bg-[#1a1d27] rounded-xl shadow-2xl border border-[#2e3345] max-w-sm w-full">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Join Room</h2>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Enter your name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0f111a] border border-[#2e3345] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="John Doe"
                autoFocus
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Join Collaboration
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f111a] text-white overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-[#1a1d27] border-b border-[#2e3345] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">CodeWave</h1>
          <div className="h-4 w-px bg-[#2e3345]"></div>
          <div className="text-sm text-gray-400 font-mono bg-[#0f111a] px-3 py-1 rounded-md border border-[#2e3345]">
            Room: <span className="text-indigo-400">{roomId}</span>
          </div>
        </div>
        <Presence users={users} currentUser={username} />
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area (70%) */}
        <div className="w-2/3 h-full border-r border-[#2e3345] flex flex-col">
          <CodeEditor socket={socket} roomId={roomId} />
        </div>

        {/* Sidebar Space (30%) - Contains Chat */}
        <div className="w-1/3 h-full bg-[#1a1d27] flex flex-col">
          <Chat socket={socket} messages={messages} username={username} />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:roomId" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
