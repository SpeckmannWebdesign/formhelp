"use client";

import { useState, useEffect, useRef } from "react";

interface ChatDict {
  title: string;
  placeholder: string;
  send: string;
  loading: string;
  empty: string;
  errorGeneric: string;
  errorNetwork: string;
  errorTooLong: string;
  consentNote: string;
}

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatSection({
  formId,
  lang,
  dict,
  defaultOpen = false,
}: {
  formId: string;
  lang: string;
  dict: ChatDict;
  defaultOpen?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadHistory() {
      try {
        const res = await fetch(`/api/forms/${formId}/chat`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages?.length > 0) {
            setMessages(
              data.messages.map((m: { role: string; content: string; id: string }) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
              }))
            );
          }
        }
      } catch {
        // Stille Fehlerbehandlung
      }
    }

    loadHistory();
  }, [formId, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    if (trimmed.length > 2000) {
      setError(dict.errorTooLong);
      return;
    }

    setError(null);
    setInput("");
    setIsLoading(true);

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);

    const assistantMsg: ChatMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch(`/api/forms/${formId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ki-consent": "accepted",
          "x-locale": lang,
        },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || dict.errorGeneric);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error(dict.errorGeneric);

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);

          try {
            const data = JSON.parse(jsonStr);

            if (data.done) break;
            if (data.error) throw new Error(data.error);

            if (data.text) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + data.text,
                  };
                }
                return updated;
              });
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.errorGeneric);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="bg-card-white rounded-2xl border border-surface-warm overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:px-8 sm:py-5 hover:bg-bg-sand/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
          <span className="font-medium text-text-dark">{dict.title}</span>
          {messages.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium text-primary">
              {messages.filter((m) => m.role === "user").length}
            </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Chat-Bereich */}
      {isOpen && (
        <div className="border-t border-surface-warm">
          <div className="max-h-[400px] overflow-y-auto p-4 sm:px-8 sm:py-6 space-y-4">
            {messages.length === 0 && !isLoading && (
              <p className="text-sm text-text-muted text-center py-8">{dict.empty}</p>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-text-white"
                      : "bg-bg-sand text-text-dark"
                  }`}
                >
                  {msg.role === "assistant" && !msg.content && isLoading ? (
                    <div className="flex items-center gap-2 text-text-muted">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {dict.loading}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="mx-4 sm:mx-8 mb-3 p-3 rounded-xl bg-error/5 border border-error/20">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <div className="border-t border-surface-warm p-4 sm:px-8 sm:py-4">
            <p className="text-xs text-text-muted mb-2">{dict.consentNote}</p>
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={dict.placeholder}
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-surface-warm bg-card-white px-4 py-2.5 text-sm text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                style={{ minHeight: "42px", maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="shrink-0 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-surface-warm text-text-white disabled:text-text-muted px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {dict.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
