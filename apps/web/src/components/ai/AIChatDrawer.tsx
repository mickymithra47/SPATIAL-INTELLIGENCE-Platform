'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAIChatStore } from '../../stores/useAIChatStore';
import { Bot, User, X, Send, Sparkles, Navigation, Wrench, Calendar, Compass, Shield } from 'lucide-react';

export function AIChatDrawer() {
  const { isOpen, toggleOpen, messages, sendMessage, isLoading } = useAIChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const samplePrompts = [
    { label: 'Where is Room 204?', prompt: 'Where is Room 204?', icon: Compass },
    { label: 'Directions from 101 to 204', prompt: 'How do I get from Room 101 to Room 204?', icon: Navigation },
    { label: 'Where is projector P-204?', prompt: 'Where is projector P-204?', icon: Shield },
    { label: 'Schedule in Room 204', prompt: 'What is scheduled in Room 204?', icon: Calendar },
    { label: 'Report Projector Issue', prompt: 'Create a maintenance ticket for the projector in Room 204', icon: Wrench },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col transition-all">
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Spatial Assistant <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </h3>
            <p className="text-[10px] text-slate-400">Contextual Physical Grounding • Active</p>
          </div>
        </div>

        <button
          onClick={toggleOpen}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-300 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>
                <div
                  className={`text-[9px] mt-1 text-right ${
                    isUser ? 'text-cyan-200/80' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-700 text-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs">
            <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-300 flex items-center justify-center animate-pulse">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
          Suggested Spatial Actions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                onClick={() => sendMessage(s.prompt)}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all text-left"
              >
                <Icon className="w-3 h-3 text-cyan-400" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950/80 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up or report..."
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-all flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
