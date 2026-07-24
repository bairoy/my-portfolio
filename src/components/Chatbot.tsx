"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai", text: string }[]>([
    { role: "ai", text: "Hi! I'm **Baiju AI**. Ask me anything about Baiju's experience or projects!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      // This calls the Mega RAG API we just built!
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: "ai", text: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", text: "Oops, my serverless brain disconnected. Try again!" }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all hover:scale-110 z-50 animate-pulse ${isOpen ? "hidden" : "block"}`}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragConstraints={{ left: -1000, right: 100, top: -800, bottom: 100 }}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] bg-[#030712]/80 backdrop-blur-2xl border border-blue-500/30 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.25)] z-50 flex flex-col overflow-hidden cursor-move ring-1 ring-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-gradient-to-r from-blue-900/40 to-purple-900/40">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium text-white">Baiju AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-tr-sm shadow-lg shadow-blue-900/20"
                      : "bg-blue-950/40 backdrop-blur-md text-blue-50 rounded-tl-sm border border-blue-500/20"
                    }`}>
                    {msg.role === "user" ? (
                      msg.text
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                          a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-blue-950/40 backdrop-blur-md rounded-2xl rounded-tl-sm px-4 py-3 border border-blue-500/20">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-[#030712]/80">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-blue-950/20 border border-blue-500/30 rounded-full pl-4 pr-12 py-3 text-sm text-white placeholder:text-blue-300/50 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full disabled:opacity-50 transition-colors shadow-md"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
