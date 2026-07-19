"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState<any[]>([]);

  const { data: history, isLoading, error } = useQuery({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      const res = await fetch("/api/chat/history");
      if (!res.ok) {
        if (res.status === 403) throw new Error("PREMIUM_REQUIRED");
        throw new Error("Failed to load history");
      }
      return res.json();
    }
  });

  useEffect(() => {
    if (history && history.length > 0 && localMessages.length === 0) {
      setLocalMessages(history);
    }
  }, [history]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (data) => {
      setLocalMessages(prev => [...prev, { role: "ASSISTANT", content: data.message }]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    const userMessage = input.trim();
    setInput("");
    setLocalMessages(prev => [...prev, { role: "USER", content: userMessage }]);
    sendMessage.mutate(userMessage);
  };

  if (isLoading) return <div className="p-8 text-center text-on-surface-variant animate-pulse font-label-caps">Initializing Fitto AI...</div>;

  if (error && error.message === "PREMIUM_REQUIRED") {
    return (
      <div className="flex flex-col items-center justify-center h-full glass-card rounded-[24px] p-8 text-center animate-fade-up">
        <div className="w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[#10b981] text-[40px]">lock</span>
        </div>
        <h2 className="font-display-lg text-[32px] font-bold text-on-surface mb-4">Unlock Fitto AI</h2>
        <p className="text-on-surface-variant max-w-md mb-8">
          Fitto is an elite AI coach that analyzes your daily meals and workouts to give you highly personalized fitness advice. Upgrade to Pro to access this feature!
        </p>
        <Link href="/dashboard/profile" className="bg-primary text-on-primary-container px-8 py-3 rounded-full font-bold hover:bg-primary-fixed transition-colors shadow-[0_0_15px_rgba(78,222,163,0.4)]">
          Go to Profile to Upgrade
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full glass-card rounded-[24px] overflow-hidden shadow-2xl relative animate-fade-up delay-100">
      
      <div className="bg-surface-container-low/80 backdrop-blur-md p-5 border-b border-white/5 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
          <span className="material-symbols-outlined text-primary text-[24px]">smart_toy</span>
        </div>
        <div>
          <h3 className="font-headline-md text-on-surface text-xl flex items-center gap-2">
            Fitto AI 
            <span className="text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-secondary text-on-primary px-2 py-0.5 rounded-sm">PRO</span>
          </h3>
          <p className="text-xs text-on-surface-variant">Online | Context-aware</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth hide-scroll relative z-10">
        {localMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-90 animate-fade-up">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 border border-primary/10 emerald-glow">
              <span className="material-symbols-outlined text-primary text-[48px]">smart_toy</span>
            </div>
            <h4 className="font-display-lg text-[32px] mb-3 text-on-surface">Hi, I'm Fitto.</h4>
            <p className="text-on-surface-variant max-w-md text-[14px]">
              I can see your logged meals and workouts. Ask me anything about your progress, calorie goals, or training tips!
            </p>
          </div>
        )}

        {localMessages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-4 max-w-[85%]", msg.role === "USER" ? "ml-auto flex-row-reverse" : "animate-fade-up")}>
            <div className={cn("shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm", msg.role === "USER" ? "bg-secondary text-on-secondary" : "bg-primary text-on-primary")}>
              <span className="material-symbols-outlined text-[20px]">{msg.role === "USER" ? "person" : "smart_toy"}</span>
            </div>
            <div className={cn("px-5 py-4 rounded-[20px]", msg.role === "USER" ? "user-bubble text-on-surface rounded-tr-sm" : "ai-bubble text-on-surface rounded-tl-sm")}>
              <div className="prose prose-sm dark:prose-invert max-w-none font-body-md text-[14px] leading-relaxed prose-p:my-1 prose-ul:my-1 text-on-surface">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {sendMessage.isPending && (
          <div className="flex gap-4 max-w-[85%] animate-fade-up">
            <div className="shrink-0 w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div className="px-5 py-4 rounded-[20px] ai-bubble rounded-tl-sm flex items-center gap-1.5 h-[52px]">
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.3s]"></span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 border-t border-white/5 bg-surface-container-low/80 backdrop-blur-md relative z-10">
        <div className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Fitto..."
            className="w-full bg-background/50 border border-white/10 rounded-full pl-6 pr-14 py-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface placeholder:text-white/20 transition-all"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sendMessage.isPending}
            className="absolute right-2 w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-full hover:bg-primary-fixed transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_10px_rgba(78,222,163,0.3)]"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
