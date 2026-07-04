"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { aiApi } from "@/lib/api";
import { cn, getApiErrorMessage } from "@/lib/utils";
import { VoiceInputButton } from "@/components/shared/voice-input-button";
import { PageHeader, EmptyState } from "@/components/shared/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const CONTEXT_TABS = [
  { id: "farming", label: "Farming" },
  { id: "loan", label: "Loan" },
  { id: "scheme", label: "Scheme" },
  { id: "trust_score", label: "Trust Score" },
] as const;

type ContextType = (typeof CONTEXT_TABS)[number]["id"];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  fallbackTips?: string[];
  unavailable?: boolean;
}

export default function AIAssistantPage() {
  const [contextType, setContextType] = useState<ContextType>("farming");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: ({ message, context }: { message: string; context: string }) =>
      aiApi.chat(message, context),
    onSuccess: (response) => {
      const data = response.data;
      if (data.available && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.reply!,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.message || "AI assistant is not available.",
            fallbackTips: data.fallback_tips,
            unavailable: true,
          },
        ]);
      }
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to get AI response"));
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          unavailable: true,
        },
      ]);
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
    ]);
    setInput("");
    chatMutation.mutate({ message: trimmed, context: contextType });

    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 100);
  };

  const showEmptyState = messages.length === 0 && !chatMutation.isPending;

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col space-y-4">
      <PageHeader
        title="AI Assistant"
        description="Get personalized guidance on farming, loans, schemes, and trust scores"
      />

      <div className="flex flex-wrap gap-2">
        {CONTEXT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setContextType(tab.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              contextType === tab.id
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col p-0">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {showEmptyState ? (
              <div className="flex h-full flex-col items-center justify-center py-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                  <Bot className="h-8 w-8" />
                </div>
                <EmptyState
                  title="Ask UNNATI AI anything"
                  description="Choose a context tab above and ask about crop planning, loan eligibility, government schemes, or improving your trust score."
                />
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {[
                    "What crops suit kharif season?",
                    "How can I improve my trust score?",
                    "Which schemes am I eligible for?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-100"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === "user"
                        ? "bg-emerald-600 text-white"
                        : msg.unavailable
                          ? "border border-amber-200 bg-amber-50 text-amber-950"
                          : "border border-emerald-100 bg-white text-emerald-950 shadow-sm"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="mb-1 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-600">UNNATI AI</span>
                        {msg.unavailable && (
                          <Badge variant="warning" className="ml-1 text-[10px]">
                            Offline
                          </Badge>
                        )}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.fallbackTips && msg.fallbackTips.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t border-amber-200 pt-3">
                        <p className="text-xs font-medium text-amber-800">Helpful tips:</p>
                        <ul className="space-y-1">
                          {msg.fallbackTips.map((tip, i) => (
                            <li key={i} className="flex gap-1.5 text-xs text-amber-900">
                              <span className="text-amber-500">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <span className="text-sm text-emerald-700">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="flex gap-2 border-t border-emerald-100 bg-emerald-50/30 p-4"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${CONTEXT_TABS.find((t) => t.id === contextType)?.label.toLowerCase()}...`}
              disabled={chatMutation.isPending}
              className="flex-1 bg-white"
            />
            <VoiceInputButton
              onTranscript={(text) => setInput((prev) => (prev ? `${prev} ${text}` : text))}
              disabled={chatMutation.isPending}
            />
            <Button type="submit" disabled={!input.trim() || chatMutation.isPending}>
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
