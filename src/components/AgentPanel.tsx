import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, HelpCircle, ArrowUpRight, Check, Bot } from 'lucide-react';
import { sendAgentMessage } from '../api.js';

export interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  time: string;
  steps?: string[];
  highlight_node_ids?: string[];
  highlight_edge_ids?: string[];
  actions?: { label: string; route?: string }[];
}

interface AgentPanelProps {
  onHighlightPath: (nodeIds: string[], edgeIds: string[]) => void;
  onSelectActionRoute?: (route: string) => void;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  onHighlightPath,
  onSelectActionRoute
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: 'Namaste. I have analyzed the estate knowledge graph for Late Shri R.K. Verma. Total estimated value is ₹1,68,50,000 across 3 institutions. How can I assist with your succession roadmap today?',
      time: 'Just now'
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Which one document unblocks the most accounts?',
    'Who is entitled to the SBI account?',
    'What is blocking the SBI account?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendAgentMessage(trimmed);

      const agentMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        text: response.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        steps: response.steps || [],
        highlight_node_ids: response.highlight_node_ids || [],
        highlight_edge_ids: response.highlight_edge_ids || [],
        actions: response.actions || []
      };

      setMessages((prev) => [...prev, agentMsg]);

      // Automatically trigger graph path highlighting
      if (response.highlight_node_ids?.length) {
        onHighlightPath(response.highlight_node_ids, response.highlight_edge_ids || []);
      }
    } catch (err) {
      console.error('Error in agent response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-sm relative">
      {/* Agent Panel Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0D9488] border border-teal-200 flex items-center justify-center font-bold font-serif text-lg">
            W
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1E293B] flex items-center gap-1.5 font-serif">
              Waaris AI Advisor
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Context: Late Shri R.K. Verma Estate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-[#0D9488] text-xs font-semibold rounded-full border border-teal-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
          <span>Live Sync</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`flex gap-3 max-w-[94%] ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-[#0D9488] text-white'
                  }`}
                >
                  {isUser ? 'You' : 'W'}
                </div>

                {/* Message Bubble Content */}
                <div className="flex flex-col space-y-2">
                  {/* Tool steps if present */}
                  {!isUser && msg.steps && msg.steps.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[11px] mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span>Execution Reasoning Steps</span>
                      </div>
                      {msg.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#0D9488] flex-shrink-0 mt-0.5" />
                          <span className="leading-snug text-slate-700">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Main Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-[16px] leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-[#0D9488] text-white rounded-tr-sm'
                        : 'bg-white border border-slate-200 text-[#1E293B] rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Why this answer chip */}
                  {!isUser && msg.highlight_node_ids && msg.highlight_node_ids.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() =>
                          onHighlightPath(
                            msg.highlight_node_ids || [],
                            msg.highlight_edge_ids || []
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 hover:bg-teal-100 text-[#0D9488] border border-teal-200 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                        title="Highlight nodes and relationships on the canvas"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Why this answer?</span>
                      </button>

                      {msg.actions?.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (act.route && onSelectActionRoute) {
                              onSelectActionRoute(act.route);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-medium transition cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <ArrowUpRight className="w-3 h-3 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[11px] text-slate-400 px-1 font-medium">
                    {msg.time}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-xs font-bold">
              W
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-500 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs font-medium">Analyzing estate graph & legal statutes...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions & Prompt Input Box */}
      <div className="p-4 sm:p-5 border-t border-slate-200 bg-white">
        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-xs bg-slate-50 hover:bg-teal-50 hover:text-[#0D9488] hover:border-teal-300 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 transition-all font-medium text-left truncate max-w-full cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about assets, heirs, or legal requirements..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-[16px] text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#0D9488] focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 bg-[#0D9488] hover:bg-teal-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
