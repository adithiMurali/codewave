import { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import { FiPlay } from 'react-icons/fi';
import TerminalOutput from './TerminalOutput';

const languages = {
  javascript: { name: 'JavaScript', ext: javascript() },
  python: { name: 'Python', ext: python() },
  cpp: { name: 'C++', ext: cpp() },
  java: { name: 'Java', ext: java() },
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const templates = {
  javascript: `// Write your JavaScript code here\nconsole.log("Hello from CodeWave!");\n`,
  python: `# Write your Python code here\nprint("Hello from CodeWave!")\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from CodeWave!" << endl;\n    return 0;\n}\n`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from CodeWave!");\n    }\n}\n`
};

function CodeEditor({ socket, roomId }) {
  const [code, setCode] = useState(templates.javascript);
  const [language, setLanguage] = useState('javascript');
  const [isTyping, setIsTyping] = useState(false);
  
  // Execution state
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket.on('room-state', (state) => {
      setCode(state.code);
      setLanguage(state.language);
    });

    socket.on('code-change', (newCode) => {
      setCode(newCode);
    });

    socket.on('language-change', (newLanguage) => {
      setLanguage(newLanguage);
    });

    return () => {
      socket.off('room-state');
      socket.off('code-change');
      socket.off('language-change');
    };
  }, [socket]);

  const onChange = (val) => {
    setCode(val);
    socket.emit('code-change', val);
    
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
  };

  const onLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket.emit('language-change', newLang);
    
    // Check if the current code is a default template, empty, or starts with a comment.
    // To be safe, we'll prompt or just replace if it's identical to another template. 
    // For simplicity, if we switch languages, we apply the new template heavily to ensure it compiles.
    const isCurrentATemplate = Object.values(templates).some(t => t.trim() === code.trim()) || code.trim() === '' || code.trim() === '// Welcome to CodeWave\n// Start typing to collaborate in real-time';
    
    if (isCurrentATemplate) {
      const newTemplate = templates[newLang];
      setCode(newTemplate);
      socket.emit('code-change', newTemplate);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      const response = await fetch(`${API_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ language, code })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to execute code');
      } else {
        if (data.run && data.run.stderr) {
           setError(data.run.stderr);
        }
        if (data.run && data.run.stdout) {
           setOutput(data.run.stdout);
        }
        if (data.run && data.run.code !== 0 && !data.run.stderr && !data.run.stdout) {
           setError(`Process exited with code ${data.run.code}`);
        }
      }
    } catch (err) {
      setError('Failed to connect to execution server');
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1a1d27]">
      {/* Editor Header / Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e212b] border-b border-[#2e3345] shrink-0">
        <div className="flex items-center gap-3">
          <select 
            value={language} 
            onChange={onLanguageChange}
            className="bg-[#0f111a] text-sm text-gray-300 border border-[#2e3345] rounded-md px-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {Object.entries(languages).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          
          {isTyping && (
            <span className="text-xs text-indigo-400 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full inline-block"></span>
              Saving changes...
            </span>
          )}
        </div>

        <button 
          onClick={runCode}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#1e212b]"
        >
          <FiPlay size={14} className={isRunning ? 'animate-pulse' : ''} />
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      </div>

      {/* CodeMirror Area (Flex grow) */}
      <div className="flex-1 overflow-auto bg-[#1a1d27] relative syntax-highlighter">
        <CodeMirror
          value={code}
          height="100%"
          theme={tokyoNight}
          extensions={[languages[language].ext]}
          onChange={onChange}
          className="h-full text-[15px] font-mono absolute inset-0"
        />
      </div>

      {/* Terminal Output Area (Fixed height bottom panel) */}
      <div className="h-64 shrink-0 border-t border-[#2e3345]">
         <TerminalOutput output={output} error={error} isRunning={isRunning} />
      </div>
    </div>
  );
}

export default CodeEditor;
