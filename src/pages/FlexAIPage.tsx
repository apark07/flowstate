import { useState, useEffect } from "react";
import NavBar from "../components/NavBar.tsx";
import { startNewChat } from "../services/geminiService.ts";
import { type Chat } from "@google/genai"; // Import Chat type

interface Message {
  text: string;
  sender: "user" | "ai";
}

export default function FlexAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null); // State to hold the persistent chat session

  // Initialize the chat session on component mount
  useEffect(() => {
    try {
        const session = startNewChat();
        setChatSession(session);
        console.log("Flex AI Chat session started.");
    } catch (e) {
        setError("Failed to initialize Flex AI. Please check your Gemini API key.");
        console.error("Chat initialization error:", e);
    }
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !chatSession) return;

    const userMessageText = input.trim();
    const userMessage: Message = { text: userMessageText, sender: "user" };
    
    // Add user message to history
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Use chatSession to send message, retaining history
      const response = await chatSession.sendMessage({ message: userMessageText });
      
      const aiResponseText = response.text;

      if (aiResponseText === undefined || aiResponseText === null) {
        throw new Error("Model failed to generate a text response.");
      }
      
      const aiMessage: Message = {
        text: aiResponseText,
        sender: "ai",
      };
      
      // Add AI response to history
      setMessages((prev) => [...prev, aiMessage]);

    } catch (err) {
      console.error("Gemini Chat Error:", err);
      setError("I'm sorry, I lost my train of thought. Please start a new query.");
    } finally {
      setLoading(false);
    }
  };

  const getMessageStyle = (sender: "user" | "ai") => {
    return sender === "user"
      ? "bg-indigo-600 text-white self-end rounded-br-none"
      : "bg-gray-100 text-gray-800 self-start rounded-tl-none";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar pageText="Flex AI Chatbot" />

      {/* Main Chat Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="bg-white rounded-lg shadow-xl flex flex-col h-[75vh]">
          {/* Chat History Area */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Flex AI!
                </h3>
                <p className="max-w-md">
                  I'm your personalized AI fitness coach. Ask me for workout ideas, diet tips, or help continuing a conversation with context!
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xl p-3 rounded-lg shadow-md ${getMessageStyle(
                      msg.sender
                    )}`}
                  >
                    {msg.sender === "ai" && (
                      <span className="font-semibold text-sm block mb-1">Flex AI</span>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-xl p-3 rounded-lg shadow-md bg-gray-100 rounded-tl-none">
                    <div className="flex items-center space-x-2">
                        <div className="animate-pulse h-2.5 w-2.5 bg-indigo-500 rounded-full"></div>
                        <div className="animate-pulse h-2.5 w-2.5 bg-indigo-500 rounded-full delay-150"></div>
                        <div className="animate-pulse h-2.5 w-2.5 bg-indigo-500 rounded-full delay-300"></div>
                    </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 py-3 text-red-600 bg-red-50 border-t border-red-200">
              {error}
            </div>
          )}
          
          {/* Input Form */}
          <form onSubmit={handleSend} className="p-6 border-t border-gray-200">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || !chatSession}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-100"
                placeholder={!chatSession ? "Initializing chat..." : "Ask Flex AI for a workout plan or fitness tips..."}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || !chatSession}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-indigo-300"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}