'use client';

import React, { useState } from 'react';
import { useAIChatStore } from '../../stores/useAIChatStore';
import { Sparkles, ArrowRight, Mic, Bot } from 'lucide-react';

export function GlobalAIChatBar() {
  const [input, setInput] = useState('');
  const { sendMessage, isLoading, toggleOpen } = useAIChatStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-4">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 transition-all hover:border-cyan-500/50"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mr-2">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your campus (e.g. 'Where is my next class?' or 'Report projector in Lab 2')..."
          className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm px-2"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-cyan-500 transition-colors"
            title="Voice input (V2)"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleOpen}
            className="p-2 text-slate-400 hover:text-cyan-500 transition-colors"
            title="Toggle AI Chat History"
          >
            <Bot className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
