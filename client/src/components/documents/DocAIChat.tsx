import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, Loader2, Bot, User } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DocAIChatProps {
  documentId: string;
  documentTitle: string;
}

export const DocAIChat: React.FC<DocAIChatProps> = ({ documentId, documentTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/data/${documentId}/talk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // Handle different possible response structures from n8n
      let assistantMsg = "I'm sorry, I couldn't process that.";
      if (data.success && data.data) {
        if (typeof data.data === 'string') {
          assistantMsg = data.data;
        } else if (data.data.output) {
          assistantMsg = data.data.output;
        } else if (data.data.response) {
          assistantMsg = data.data.response;
        } else if (data.data.message) {
          assistantMsg = data.data.message;
        } else if (Array.isArray(data.data) && data.data.length > 0) {
          const first = data.data[0];
          assistantMsg = first.output || first.response || first.message || JSON.stringify(first);
        } else {
          assistantMsg = JSON.stringify(data.data);
        }
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the AI Intelligence Node. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-widest uppercase shadow-xl shadow-indigo-600/20 h-9 w-48 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-[10px]">
          <MessageSquare className="h-3.5 w-3.5" />
          Talk with DocAI
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] bg-white border-slate-200 rounded-t-[40px] shadow-2xl">
        <div className="mx-auto w-full max-w-4xl h-full flex flex-col overflow-hidden">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 shrink-0" />
          
          <DrawerHeader className="border-b border-slate-50 px-8 py-6 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-inner">
                <Bot className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <DrawerTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                  DocAI Node <span className="text-indigo-600">01</span>
                </DrawerTitle>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
                    Analyzing: {documentTitle}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-2xl hover:bg-slate-50 h-12 w-12">
              <X className="h-6 w-6 text-slate-400" />
            </Button>
          </DrawerHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-8 py-6" ref={scrollRef}>
              <div className="space-y-8 pb-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-indigo-600/10 blur-3xl rounded-full" />
                      <div className="relative p-8 bg-white border border-indigo-100 rounded-[40px] shadow-2xl shadow-indigo-600/5">
                        <Bot className="h-16 w-16 text-indigo-600" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-3">Intelligence Initialized</h3>
                    <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                      This node has synchronized with your document. Ask me for summaries, specific data extraction, or complex analysis.
                    </p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-slate-900' : 'bg-indigo-600'}`}>
                        {msg.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
                      </div>
                      <div className={`p-5 rounded-[24px] text-base font-medium leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-tr-none' 
                          : 'bg-indigo-50/50 border border-indigo-100 text-slate-800 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="max-w-[85%] flex items-start gap-4">
                      <div className="shrink-0 h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="p-5 rounded-[24px] rounded-tl-none bg-indigo-50/50 border border-indigo-100">
                        <div className="flex gap-1.5">
                          <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="p-8 border-t border-slate-50 bg-white shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex items-center gap-4 group"
            >
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-indigo-600/5 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Query institutional intelligence..."
                  className="relative bg-slate-50 border-slate-200 focus:bg-white focus:ring-indigo-500/50 rounded-[20px] h-16 text-base font-bold pl-6 transition-all shadow-inner"
                />
              </div>
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-slate-900 hover:bg-black text-white rounded-[20px] h-16 w-16 p-0 shadow-2xl shadow-slate-900/20 active:scale-95 transition-all shrink-0"
              >
                <Send className="h-6 w-6" />
              </Button>
            </form>
            <p className="text-[9px] text-center text-slate-400 font-black tracking-[0.2em] uppercase mt-4">
              Unfazed DocStream AI • Node-Link Enabled
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
