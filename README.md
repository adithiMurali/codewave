# 🌊 CodeWave

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-61dafb.svg?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933.svg?logo=nodedotjs)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-white.svg?logo=socketdotio)

**CodeWave** is a powerful, real-time collaborative code editor built for seamless pair programming algorithms and remote interviews. It features zero-config URL sharing, live cursor/presence tracking, an integrated chat, and a custom-built secure local code execution engine supporting multiple languages.

### 🚀 [Live Demo](https://adithiMurali.github.io/codewave)

---

## ✨ Features
- **Real-time Collaboration:** Instantly sync code and see active users using WebSockets.
- **Multi-Language Execution Engine:** Compile and run JavaScript, Python, C++, and Java code instantaneously directly inside the editor. 
- **Live Chat:** Communicate seamlessly inside the same IDE window.
- **Rich User Interface:** Built with a beautiful Tokyo Night theme, syntax highlighting, and responsive flex layouts.
- **Zero-config Sharing:** Unique secure room URLs generated automatically using UUIDs.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, `@uiw/react-codemirror` (Tokyo Night theme).
- **Backend:** Node.js, Express, Socket.io, `child_process` execution engine.
- **Deployment:** GitHub Pages (Frontend) & Render (Backend Dockerized).

## 💻 Running Locally

### Prerequisites
Make sure you have Node.js installed, as well as the compilers for any languages you wish to execute locally (`python`, `javac`, `g++`).

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/adithiMurali/codewave.git
   cd codewave
   ```

2. **Setup the backend:**
   ```bash
   cd server
   npm install
   node index.js
   ```
   *(Server will run on `http://localhost:5000`)*

3. **Setup the frontend:**
   Open a new terminal and run:
   ```bash
   cd client
   npm install --legacy-peer-deps
   npm run dev
   ```
   *(Frontend will run on `http://localhost:5173`)*

## 🌐 System Architecture
- **Room Management:** Rooms are dynamically allocated in-memory on the Express server. User presence and events are tracked via Socket IDs.
- **Execution Engine:** Code payloads are parsed, verified, and mapped to local system binaries asynchronously via `child_process`. Output and exit codes are streamed securely back down to the user's Terminal UI.
