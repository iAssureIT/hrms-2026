"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPaperPlane, FaPaperclip, FaCheckCircle, FaTimes, FaFileAlt } from "react-icons/fa";
import moment from "moment";
import ls from "localstorage-slim";

const TicketChat = ({ ticket, onRefresh }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      fileName: file.name,
      fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
      _file: file
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const details = ls.get("userDetails", { decrypt: true });
    setCurrentUser(details);
    if (ticket) {
      fetchMessages();
    }
  }, [ticket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/ticket-messages/${ticket._id}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket) return;

    try {
      setLoading(true);
      const cleanedAttachments = attachments.map(att => ({
        fileName: att.fileName,
        fileUrl: "uploads/" + att.fileName
      }));

      const res = await axios.post("/api/ticket-messages/send", {
        ticketId: ticket._id,
        senderId: currentUser?.user_id,
        message: newMessage,
        attachments: cleanedAttachments
      });
      if (res.data.success) {
        setMessages([...messages, { ...res.data.data, senderId: currentUser }]);
        setNewMessage("");
        setAttachments([]);
        
        // Auto-move to In Progress if currently Open and replied by admin
        if (ticket.status === "Open") {
          await axios.patch(`/api/tickets/update-status/${ticket._id}`, {
            status: "In Progress",
            performedBy: currentUser?.user_id,
          });
          onRefresh();
        }
      }
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const markResolved = async () => {
    try {
      const res = await axios.patch(`/api/tickets/update-status/${ticket._id}`, {
        status: "Resolved",
        performedBy: currentUser?.user_id,
      });
      if (res.data.success) {
        onRefresh();
      }
    } catch (err) {
      console.error("Status Update Error:", err.response?.data);
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to update status");
    }
  };

  if (!ticket) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white border-l border-gray-100 italic">
        Select a ticket to view the conversation
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white border-l border-gray-100">
      {/* Ticket Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 font-bold shadow-sm">
            {ticket.employeeId?.employeeName?.charAt(0) || "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800">{ticket.subject}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                ticket.status === "Open" ? "bg-green-100 text-green-700" :
                ticket.status === "In Progress" ? "bg-teal-100 text-teal-700" :
                ticket.status === "Resolved" ? "bg-gray-100 text-gray-600" :
                "bg-red-100 text-red-700"
              }`}>
                {ticket.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <span className="font-mono font-semibold">{ticket.ticketID}</span>
              <span>•</span>
              <span className="font-medium text-gray-700">{ticket.employeeId?.employeeName}</span>
              <span>•</span>
              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold uppercase text-gray-500 tracking-wider font-sans">{ticket.category}</span>
            </div>
          </div>
        </div>
        {ticket.status !== "Resolved" && ticket.status !== "Closed" && (
          <button
            onClick={markResolved}
            className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all shadow-sm group"
          >
            <FaCheckCircle className="text-gray-400 group-hover:text-green-500 transition-colors" /> Mark Resolved
          </button>
        )}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm max-w-2xl">
          <p className="text-sm text-gray-700 leading-relaxed font-medium">{ticket.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">{moment(ticket.createdAt).format("MMM DD, YYYY • h:mm A")}</div>
            {ticket.priority === "Urgent" && (
              <div className="bg-red-50 text-red-500 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase animate-pulse border border-red-100 tracking-tighter">Urgent Priority</div>
            )}
          </div>
        </div>

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${msg.senderId?._id === currentUser?.user_id || msg.senderId === currentUser?.user_id ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm ${
              msg.senderId?._id === currentUser?.user_id || msg.senderId === currentUser?.user_id ? "bg-green-600 text-white" : "bg-white border border-gray-100 text-gray-800"
            }`}>
              {msg.senderId?.profile?.firstname?.charAt(0) || msg.senderId?.username?.charAt(0) || "U"}
            </div>
            <div className={`max-w-md p-4 rounded-2xl shadow-sm text-sm ${
              msg.senderId?._id === currentUser?.user_id || msg.senderId === currentUser?.user_id ? "bg-green-600 text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-700 rounded-tl-none font-medium"
            }`}>
              {msg.message}
              <div className={`text-[9px] mt-2 font-bold tracking-tight uppercase ${
                msg.senderId?._id === currentUser?.user_id || msg.senderId === currentUser?.user_id ? "text-green-100/70" : "text-gray-400"
              }`}>
                {moment(msg.createdAt).fromNow()}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Reply Box */}
      {ticket.status !== "Closed" && (
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="relative bg-gray-50 border border-gray-100 rounded-2xl focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all shadow-inner group overflow-hidden">
            <textarea
              className="w-full bg-transparent p-4 pr-32 text-sm text-gray-700 placeholder:text-gray-400 outline-none resize-none min-h-[100px] font-medium"
              placeholder="Type your response here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            ></textarea>
            
            {attachments.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded-lg shadow-sm animate-in slide-in-from-bottom-1">
                    <FaFileAlt className="text-green-500" size={10} />
                    <span className="text-[10px] font-bold text-gray-700 truncate max-w-[100px]">{file.fileName}</span>
                    <button type="button" onClick={() => removeAttachment(idx)} className="text-gray-400 hover:text-red-500">
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <input 
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm"
              >
                <FaPaperclip size={16} />
              </button>
            </div>
            <div className="absolute bottom-3 right-3">
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-green-700 shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:shadow-none translate-y-0 active:translate-y-0.5"
              >
                <FaPaperPlane size={12} /> {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
          <p className="text-[10px] text-gray-400 mt-2 ml-1 font-medium tracking-wide italic opacity-70">SLA Deadline: {moment(ticket.slaDeadline).format("MMM DD, h:mm A")} ({moment(ticket.slaDeadline).fromNow()})</p>
        </div>
      )}
    </div>
  );
};

export default TicketChat;
