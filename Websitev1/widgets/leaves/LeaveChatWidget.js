"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaRobot, FaPaperPlane, FaTimes, FaMinus, FaQuestionCircle } from "react-icons/fa";
import ls from "localstorage-slim";
import moment from "moment";

const LeaveChatWidget = ({ employeeId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your Leave Assistant. How can I help you today?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (messages.length === 1 && employeeId) {
        fetchHistory();
      }
    }
  }, [isOpen, messages]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`/api/leave-chat/history/${employeeId}`);
      if (res.data.success && res.data.data.length > 0) {
        const history = res.data.data.flatMap(log => [
          { role: "user", content: log.userMessage, time: log.createdAt },
          { role: "assistant", content: log.aiResponse, time: log.createdAt }
        ]);
        setMessages(history);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  };

  const handleSend = async (e, quickText = null) => {
    const text = quickText || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/api/leave-chat", {
        employeeId,
        message: text,
      });

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.data.response, time: new Date() },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again later.",
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickButtons = [
    { label: "Check Balance", query: "What is my current leave balance?" },
    { label: "Why LOP?", query: "Why is my leave marked as LOP?" },
    { label: "Leave Summary", query: "Give me a summary of my leave usage this year." },
  ];

  const isReady = !!employeeId;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#3c8dbc] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-full">
                <FaRobot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold">Leave Assistant</h3>
                <p className="text-[10px] text-white/80">Online | AI Powered</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsOpen(false)} className="hover:text-gray-200 transition-colors">
                <FaMinus size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 h-[400px] overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
            {!isReady && (
              <div className="bg-yellow-50 border border-yellow-100 p-3 rounded text-[10px] text-yellow-700 mb-2">
                <strong>Admin Note:</strong> Please select an employee from the dropdown to see their leave data.
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#3c8dbc] text-white rounded-tr-none"
                      : "bg-white text-gray-700 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                <span className="text-[9px] text-gray-400 mt-1">
                  {moment(msg.time).format("HH:mm")}
                </span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-400 text-[10px]">
                <div className="flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </div>
                Assistant is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Buttons */}
          <div className="px-4 py-2 bg-gray-50 flex flex-wrap gap-2 border-t border-gray-100">
            {quickButtons.map((btn, i) => (
              <button
                key={i}
                onClick={(e) => handleSend(e, btn.query)}
                disabled={loading}
                className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-full hover:border-[#3c8dbc] hover:text-[#3c8dbc] transition-all shadow-sm"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(e);
            }}
            className="p-3 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isReady ? "Ask about your leaves..." : "Select an employee first..."}
              className="flex-1 border border-gray-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#3c8dbc]"
              disabled={loading || !isReady}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !isReady}
              className={`p-2 rounded transition-all ${
                loading || !input.trim()
                  ? "bg-gray-100 text-gray-300"
                  : "bg-[#3c8dbc] text-white hover:bg-[#367fa9] shadow-md"
              }`}
            >
              <FaPaperPlane size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? "bg-gray-400 rotate-90" : "bg-[#3c8dbc]"
        } text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center`}
      >
        {isOpen ? <FaTimes size={24} /> : <FaRobot size={24} />}
      </button>
    </div>
  );
};

export default LeaveChatWidget;
