import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  Info,
  ChevronRight,
  HelpCircle,
  LifeBuoy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/config/api';

interface Message {
  role: 'user' | 'model';
  parts: string;
  timestamp: string;
}

interface SupportChatBotProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SupportChatBot = ({ isOpen: externalIsOpen, onOpenChange }: SupportChatBotProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // If externally opened and no session, start one
  useEffect(() => {
    if (isOpen && !sessionId && !isLoading) {
      handleStartChat();
    }
  }, [isOpen, sessionId]);

  const handleStartChat = async () => {
    if (sessionId) {
      setIsOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      setIsOpen(true);

      const response = await fetch(`${API_BASE_URL}/support/chat/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ initialTopic: 'Hello, I need help.' })
      });

      if (!response.ok) throw new Error('Failed to start chat');

      const data = await response.json();
      setSessionId(data.sessionId);
      setMessages([
        { role: 'user', parts: 'Hello, I need help.', timestamp: new Date().toISOString() },
        { role: 'model', parts: data.message, timestamp: new Date().toISOString() }
      ]);
    } catch (error) {
      console.error('Error starting support chat:', error);
      toast.error('Failed to connect to AI assistant.');
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading || !sessionId) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    const newMessages = [
      ...messages,
      { role: 'user' as const, parts: userMessage, timestamp: new Date().toISOString() }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/support/chat/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage
        })
      });

      if (!response.ok) throw new Error('Failed to continue chat');

      const data = await response.json();
      setMessages([
        ...newMessages,
        { role: 'model', parts: data.message, timestamp: new Date().toISOString() }
      ]);
    } catch (error) {
      console.error('Error continuing support chat:', error);
      toast.error('Connection lost. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={handleStartChat}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 h-16 w-16 rounded-3xl shadow-2xl bg-blue-600 hover:bg-black text-white hover:scale-110 transition-all duration-300 z-50 group border-4 border-white"
      >
        <MessageSquare className="h-8 w-8" />
        <span className="absolute -top-12 right-0 bg-white text-blue-600 text-[10px] font-black py-1 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg uppercase tracking-widest whitespace-nowrap border border-blue-100">
          UHC Assistant
        </span>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-[calc(100vw-32px)] md:w-[420px] h-[70vh] md:h-[650px] z-50 animate-in slide-in-from-bottom-5 duration-500">
      <Card className="h-full rounded-[2.5rem] border-none shadow-[0_20px_80px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden bg-white/95 backdrop-blur-xl">
        <CardHeader className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 text-white p-6 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full -ml-12 -mb-12 blur-2xl" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                <Sparkles className="h-6 w-6 text-blue-100" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-xl font-black tracking-tight">Support Assistant</CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <CardDescription className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Always Active</CardDescription>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50/50">
          <ScrollArea className="h-full px-6 py-6">
            <div className="space-y-6 pb-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-${msg.role === 'user' ? 'right' : 'left'}-4 duration-500`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`mt-1 shrink-0 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-blue-600 border border-blue-50'
                      }`}>
                      {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`p-4 rounded-[1.5rem] shadow-sm text-sm font-medium leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                      }`}>
                      {msg.parts}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="mt-1 h-8 w-8 rounded-xl bg-white text-blue-600 flex items-center justify-center border border-blue-50 shadow-sm animate-pulse">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="p-4 rounded-[1.5rem] rounded-tl-sm bg-white border border-slate-100 flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-6 bg-white border-t border-slate-100 shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="w-full flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner group focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about UHC..."
              className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm font-medium"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !inputValue.trim()}
              className="h-10 w-10 bg-blue-600 hover:bg-black text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-300"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>

      <div className="mt-4 flex items-center justify-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
        <Info className="h-3 w-3" />
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
          AI generated guidance based on UHC knowledge base
        </span>
      </div>
    </div>
  );
};
