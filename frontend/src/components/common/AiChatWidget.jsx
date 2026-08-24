import { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Minimize2,
  Trash2,
  Brain,
  Zap,
  Bot
} from 'lucide-react';
import { chatWithAiAssistant } from '../../services/tripService';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

const quickPrompts = [
  'Top local foods to try',
  'What should I pack?',
  'Best sunset viewpoints',
  'Safety & cultural tips'
];

const thinkingSteps = [
  'Analyzing destination & context...',
  'Querying live travel telemetry...',
  'Synthesizing tailored recommendations...'
];

export default function AiChatWidget({ tripContext = null }) {
  const { user } = useAuth();
  const { showToast } = useModal();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm your WanderSync AI Travel Concierge powered by Google Gemini. Ask me about itinerary updates, local food spots, packing tips, or travel recommendations!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const messagesEndRef = useRef(null);
  const thinkingTimerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  useEffect(() => {
    if (loading) {
      setThinkingStep(0);
      setThinkingSeconds(0);
      thinkingTimerRef.current = setInterval(() => {
        setThinkingSeconds((s) => s + 1);
        setThinkingStep((step) => (step + 1) % thinkingSteps.length);
      }, 1200);
    } else {
      if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);
    }
    return () => {
      if (thinkingTimerRef.current) clearInterval(thinkingTimerRef.current);
    };
  }, [loading]);

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
    } catch {
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="size-12 rounded-full bg-[#121215] border border-orange-500/40 hover:border-orange-500 flex items-center justify-center text-orange-400 shadow-xl shadow-orange-950/40 hover:scale-110 transition-all duration-200 cursor-pointer relative group"
          title="WanderSync AI Concierge"
        >
          <Bot className="size-5 text-orange-400 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-orange-400 rounded-full animate-pulse ring-2 ring-[#121215]" />
        </button>
      )}

      {isOpen && (
        <div className="w-[calc(100vw-2rem)] max-w-[390px] sm:w-[390px] bg-[#121215] border border-orange-500/30 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[520px] max-h-[82vh] animate-in slide-in-from-bottom-5 duration-200">
          <div className="px-4 py-3 border-b border-border/80 bg-secondary/40 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Bot className="size-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <span>WanderSync Concierge</span>
                  <span className="bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[9px] px-1.5 py-0.2 rounded-full font-semibold flex items-center gap-1">
                    <span className="size-1.5 bg-orange-400 rounded-full animate-ping" />
                    <span>Gemini 3.7</span>
                  </span>
                </h2>
                <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                  {tripContext ? `Context: ${tripContext.destination || 'Itinerary'}` : 'Intelligent Travel Assistant'}
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

          <div className="flex-1 p-3.5 overflow-y-auto flex flex-col space-y-3 bg-[#0a0a0c]">
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
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-medium rounded-br-none shadow-md shadow-orange-950/20'
                        : 'bg-[#18181b] text-zinc-200 border border-border/80 rounded-bl-none shadow-sm'
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
              <div className="self-start max-w-[90%] rounded-2xl p-3 bg-secondary/40 border border-orange-500/30 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-orange-400">
                  <Brain className="size-3.5 animate-spin" />
                  <span className="text-[11px] font-bold">Thinking Process</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-950/80 text-orange-300 font-mono border border-orange-800/60 ml-auto">
                    {thinkingSeconds}s
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Zap className="size-3 text-amber-400 shrink-0" />
                  <span className="animate-pulse">{thinkingSteps[thinkingStep]}</span>
                </div>
                <div className="w-full bg-secondary/80 h-1 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-full w-2/3 animate-pulse rounded-full" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2.5 bg-[#121215] border-t border-border/60 space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-orange-400 border border-border hover:border-orange-500/30 whitespace-nowrap transition-colors cursor-pointer"
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
                className="flex-1 px-3 py-2 rounded-xl bg-secondary/50 border border-border text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-sm shadow-orange-500/20"
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
