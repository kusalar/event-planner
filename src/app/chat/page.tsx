'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEventContext } from '@/context/EventContext';
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  Info,
} from 'lucide-react';

export default function ChatAssistantPage() {
  const {
    currentEvent,
    chatMessages,
    addChatMessage,
    clearChat,
    totalSpent,
    remainingBudget,
    bookedVendorsCount,
    timelineTasks,
    geminiApiKey,
    isLiveAiAvailable,
  } = useEventContext();

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showContextDrawer, setShowContextDrawer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, loading]);

  if (!currentEvent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-slate-500">Please select or create an event first.</p>
      </div>
    );
  }

  const suggestedPrompts = [
    'How can I reduce my expenses by 15%?',
    `Suggest a decoration theme for ${currentEvent.eventType === 'wedding' ? 'a Bengali wedding' : currentEvent.title}.`,
    'What should I prepare one week before the event?',
    `Create a curated catering banquet menu for ${currentEvent.guestCount} guests.`,
    'What am I forgetting in my planning checklist?',
    'What questions should I ask when interviewing the photographer?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    // Add user message
    addChatMessage(text, 'user');
    if (!textToSend) setInputMessage('');
    setLoading(true);

    // Event context object sent to the API
    const eventContext = {
      title: currentEvent.title,
      eventType: currentEvent.eventType,
      date: currentEvent.date,
      location: currentEvent.location,
      guestCount: currentEvent.guestCount,
      totalBudget: currentEvent.totalBudget,
      totalSpent,
      remainingBudget,
      foodPreferences: currentEvent.foodPreferences,
      theme: currentEvent.theme,
      bookedVendorsCount,
      completedTasksCount: timelineTasks.filter((t) => t.isCompleted).length,
      totalTasksCount: timelineTasks.length,
    };

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, { sender: 'user', content: text }],
          eventContext,
          customApiKey: geminiApiKey,
        }),
      });

      const data = await response.json();
      addChatMessage(data.reply || "I'm reviewing your event details. How else can I assist?", 'assistant', data.isLiveModel);
    } catch (e) {
      console.error('Chat error:', e);
      addChatMessage("I encountered an issue communicating with the planning engine. Please try again.", 'assistant');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full p-4 sm:p-6">
      {/* Chat Header Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 glass-card px-4 py-3 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">Eventora AI Assistant</h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  isLiveAiAvailable
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                }`}
              >
                {isLiveAiAvailable ? '⚡ Live Gemini 2.5' : 'Curated Intelligence'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Active Context: <strong className="text-slate-700 dark:text-slate-300">{currentEvent.title}</strong> (
              {currentEvent.location} • ₹{currentEvent.totalBudget.toLocaleString('en-IN')})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowContextDrawer(!showContextDrawer)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center space-x-1"
            title="Inspect context passed to AI"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Context</span>
          </button>
          <button
            onClick={clearChat}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Inspection Drawer */}
      {showContextDrawer && (
        <div className="mb-4 p-4 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/80 text-xs animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-violet-700 dark:text-violet-300 mb-2">
            <span>Live Context Memory Loaded in Assistant</span>
            <button onClick={() => setShowContextDrawer(false)} className="text-slate-400 hover:text-slate-600">
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400 block">Event:</span> {currentEvent.title}
            </div>
            <div>
              <span className="text-slate-400 block">Guests:</span> {currentEvent.guestCount}
            </div>
            <div>
              <span className="text-slate-400 block">Total Budget:</span> ₹{currentEvent.totalBudget.toLocaleString('en-IN')}
            </div>
            <div>
              <span className="text-slate-400 block">Spent:</span> ₹{totalSpent.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {/* Suggested Prompts Horizontal Scrollbar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-2 no-scrollbar text-xs">
        <span className="text-slate-400 font-semibold text-[11px] flex-shrink-0">Suggestions:</span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 whitespace-nowrap transition-colors flex-shrink-0 text-[11px] font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                  isUser
                    ? 'bg-gradient-to-tr from-pink-500 to-purple-600'
                    : 'bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-violet-600 text-white rounded-tr-none shadow-md shadow-violet-500/20'
                    : 'glass-card text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Footer time & copy */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center space-x-1"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading typing indicator */}
        {loading && (
          <div className="flex items-start space-x-3 animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="glass-card rounded-2xl rounded-tl-none p-3.5 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] text-slate-400">Consulting Eventora knowledge base...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="glass-card p-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center space-x-2 shadow-xl"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask anything about ${currentEvent.title} (e.g. 'How to negotiate venue rate?')...`}
          className="flex-1 px-3 py-2 text-xs bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-violet-500/25 transition-all disabled:opacity-40 flex items-center space-x-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

