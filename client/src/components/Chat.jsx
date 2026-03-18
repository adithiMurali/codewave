import { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';

function Chat({ socket, messages, username }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      socket.emit('chat-message', input);
      setInput('');
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#161821] border-l border-[#2e3345]">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-[#1a1d27] border-b border-[#2e3345]">
        <h2 className="text-sm font-semibold text-gray-200">Room Chat</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-10">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.username === username;
            
            return (
              <div 
                key={msg.id || index} 
                className={`flex flex-col max-w-[85%] ${isMe ? 'items-end self-end ml-auto' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-xs text-gray-400 mb-1 ml-1">{msg.username}</span>
                )}
                <div 
                  className={`px-3 py-2 rounded-xl text-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-[#2e3345] text-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 mx-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#1a1d27] border-t border-[#2e3345]">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-[#0f111a] border border-[#2e3345] text-white text-sm rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 p-1.5 text-indigo-400 hover:text-indigo-300 disabled:text-gray-600 transition-colors"
          >
            <FiSend size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
