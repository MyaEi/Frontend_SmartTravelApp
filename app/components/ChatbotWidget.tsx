'use client';

import "./ChatbotWidget.css";
import ReactMarkdown from "react-markdown";
import React, {
  useState,
  useRef,
  useEffect,
  FormEvent,
  KeyboardEvent,
} from "react";

type Role = "user" | "assistant";

type HistoryItem = {
  role: Role;
  text: string;
};

type ChatApiRequest = {
  history: HistoryItem[];
  message: string;
};

// matches your API: { reply: "Hi there..." }
type ChatApiResponse = {
  reply?: string;
  message?: string;
  history?: HistoryItem[];
};

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMessage: HistoryItem = { role: "user", text: userText };
    const newHistory = [...messages, userMessage];

    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const payload: ChatApiRequest = {
        history: newHistory,
        message: userText,
      };

      const res = await fetch("/api/chat/bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data: ChatApiResponse = await res.json();
      console.log("Chatbot API response:", data); // 🔍 debug

      // Use reply first, then message as fallback
      const assistantText =
        (data.reply ?? data.message ?? "").toString().trim();

      if (!assistantText) {
        console.warn("No text in chatbot reply; raw data:", data);
      }

      const assistantMessage: HistoryItem = {
        role: "assistant",
        text: assistantText || "[No reply text received]",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Oops, something went wrong talking to the server. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Open chat"
        className="chatbot-toggle-btn"
      >
        💬
      </button>

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <span>Smart Travel Assistant</span>
            <button
              type="button"
              className="chatbot-close-btn"
              aria-label="Close chat"
              onClick={handleToggle}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-empty">
                👋 Hi! Ask me anything about your trip.
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.role === "user"
                  ? "chat-message-user"
                  : "chat-message-assistant"
                  }`}
              >
                <div className="chat-message-role">
                  {msg.role === "user" ? "You" : "Bot"}
                </div>
                <div className="chat-message-text">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-message chat-message-assistant">
                <div className="chat-message-role">Bot</div>
                <div className="chat-message-text">
                  <ReactMarkdown>Thinking...</ReactMarkdown>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-wrapper" onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={2}
              className="chatbot-input"
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!input.trim() || isLoading}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
