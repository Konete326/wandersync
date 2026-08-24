import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Minimize2,
  Trash2,
  Compass
} from 'lucide-react';
import { chatWithAiAssistant } from '../../services/tripService';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import GlowingButton from './GlowingButton';

const quickPrompts = [
  'Top local foods to try',
  'What should I pack?',
  'Best sunset viewpoints',
  'Safety & cultural tips'
];

export default function AiChatWidget({ tripContext = null }) {
  const { user } = useAuth();
  const { showToast } = useModal();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm your WanderSync AI Travel Concierge powered by Google Gemini. Ask me anything about destinations, packing advice, weather, or itinerary recommendations!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await chatWithAiAssistant(query.trim(), historyPayload, tripContext);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.data?.reply || 'I am ready to help you plan further.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Sorry, I ran into an issue connecting to Gemini AI. Please try again in a moment.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: "Chat cleared. What else would you like to explore or plan?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    showToast('Conversation cleared', 'info');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 p-3.5 sm:px-5 sm:py-3.5 rounded-full bg-zinc-950 border border-cyan-500/50 shadow-2xl shadow-cyan-950/60 hover:border-cyan-400 hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          <div className="relative">
            <Sparkles className="size-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 size-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="hidden sm:inline text-xs font-bold text-foreground">
            AI Concierge
          </span>
        </button>
      )}

      {isOpen && (
        <div className="w-[340px] sm:w-[410px] bg-[#121215] border border-border/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom-5 duration-300 select-none">
          <div className="px-4 py-3 border-b border-border/80 bg-secondary/40 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Sparkles className="size-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <span>WanderSync Concierge</span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-1.5 py-0.5 rounded-full font-semibold">
                    Online
                  </span>
                </h2>
                <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                  {tripContext ? `Context: ${tripContext.destination || 'Itinerary'}` : 'Gemini 3.7 Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                title="Clear Chat"
              >
                <Trash2 className="size-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                title="Minimize"
              >
                <Minimize2 className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-3.5 overflow-y-auto flex flex-col space-y-3 bg-[#0c0c0e]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-cyan-600 text-white rounded-br-none shadow-md shadow-cyan-900/30'
                        : 'bg-[#18181c] text-zinc-200 border border-border/80 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-muted-foreground/60 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 bg-secondary/40 border border-border/60 rounded-2xl px-3 py-2 max-w-xs self-start animate-pulse">
                <Sparkles className="size-3.5 animate-spin" />
                <span className="text-[11px]">Gemini is crafting response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2 bg-[#121215] border-t border-border/60 space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border whitespace-nowrap transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2 items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask advice, modify itinerary, food spots..."
                className="flex-1 px-3 py-2 rounded-xl bg-secondary/50 border border-border text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
