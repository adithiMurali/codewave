function TerminalOutput({ output, error, isRunning }) {
  return (
    <div className="flex flex-col h-full bg-[#0f111a] border-[#2e3345] border-t font-mono text-sm overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1d27] border-b border-[#2e3345] shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-gray-400 text-xs ml-2 font-semibold">Execution Output</span>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2 text-indigo-400 text-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            Running...
          </div>
        )}
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto p-4 text-gray-300">
        {!output && !error && !isRunning ? (
          <div className="text-gray-600 italic">No output to display. Click "Run Code" to execute.</div>
        ) : null}

        {output && (
          <pre className="whitespace-pre-wrap font-mono leading-relaxed text-green-400">
            {output}
          </pre>
        )}

        {error && (
          <pre className="whitespace-pre-wrap font-mono leading-relaxed text-red-500 mt-2">
            {error}
          </pre>
        )}
      </div>
    </div>
  );
}

export default TerminalOutput;
