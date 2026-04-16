"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPaperPlane, FaPaperclip, FaCheckCircle, FaTimes, FaFileAlt, FaEllipsisV } from "react-icons/fa";
import { HiArrowLeft } from "react-icons/hi2";
import moment from "moment";
import ls from "localstorage-slim";

const TicketChat = ({ ticket, onRefresh, onBack }) => {
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
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/10 italic font-medium uppercase text-[11px] tracking-widest opacity-60">
        <div className="p-4 bg-slate-100 rounded-full mb-4 animate-bounce">
            <FaFileAlt size={24} className="text-slate-300" />
        </div>
        Select a ticket to view conversation
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white border-t-[3px] border-[#3c8dbc] shadow-sm z-10">
      {/* Ticket Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <HiArrowLeft size={20} />
            </button>
          )}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border-2 border-white shadow-sm">
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 font-bold text-lg uppercase">
                {ticket.employeeId?.employeeName?.charAt(0) || "U"}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-slate-800 text-lg leading-tight truncate max-w-[200px] md:max-w-md">
                {ticket.subject}
              </h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight text-white ${
                ticket.status === "Open" ? "bg-[#00a65a]" :
                ticket.status === "In Progress" ? "bg-[#f39c12]" :
                "bg-gray-400"
              }`}>
                {ticket.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1 font-normal truncate">
              <span className="font-bold text-[#3c8dbc] uppercase tracking-tight">{ticket.ticketID}</span>
              <span className="opacity-20">|</span>
              <span className="truncate">{ticket.employeeId?.employeeName}</span>
              <span className="opacity-20">|</span>
              <span className="text-gray-400 font-bold">{ticket.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
            {ticket.status !== "Resolved" && ticket.status !== "Closed" && (
            <button
                onClick={markResolved}
                className="flex items-center gap-2 text-[11px] font-bold text-gray-700 bg-white border border-gray-300 px-4 py-1.5 rounded-sm hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
                <FaCheckCircle className="text-[#00a65a]" size={12} /> Mark Resolved
            </button>
            )}
            <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                <FaEllipsisV size={14} />
            </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/30">
        <div className="flex gap-4">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-500">
                {ticket.employeeId?.employeeName?.charAt(0) || "U"}
            </div>
            <div className="space-y-1 py-1 flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-800">{ticket.employeeId?.employeeName}</span>
                    <span className="text-[11px] font-medium text-slate-400">{moment(ticket.createdAt).format("h:mm A, Today")}</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm inline-block max-w-2xl">
                    <p className="text-xs text-gray-700 leading-relaxed font-normal">
                        {ticket.description}
                    </p>
                </div>
            </div>
        </div>

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.senderId?._id === currentUser?.user_id || msg.senderId === currentUser?.user_id ? "flex-row-reverse" : ""}`}>
            <div className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
              msg.senderId?._id === currentUser?.user_id || msg.senderId === currentUser?.user_id ? "bg-green-600 text-white" : "bg-slate-200 text-slate-600"
            }`}>
              {msg.senderId?.profile?.firstname?.charAt(0) || msg.senderId?.username?.charAt(0) || "U"}
            </div>
            <div className={`flex flex-col space-y-1 ${msg.senderId?._id === currentUser?.user_id || msg.senderId === currentUser?.user_id ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-2 px-1">
                 <span className="text-[11px] font-medium text-slate-400">{moment(msg.createdAt).format("h:mm A")}</span>
              </div>
              <div className={`max-w-md p-4 rounded-sm shadow-sm text-xs font-normal ${
                msg.senderId?._id === currentUser?.user_id || msg.senderId === currentUser?.user_id 
                ? "bg-[#3c8dbc] text-white" 
                : "bg-gray-100 border border-gray-200 text-gray-700"
              }`}>
                {msg.message}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Reply Box */}
      {ticket.status !== "Closed" && (
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="bg-gray-50 border border-gray-200 rounded-sm overflow-hidden">
            <textarea
              className="w-full bg-transparent p-5 text-sm text-slate-700 placeholder:text-slate-400 outline-none resize-none min-h-[80px] font-medium"
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
            
            <div className="px-5 pb-4 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-1">
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
                        className="p-2.5 text-slate-400 hover:text-green-600 hover:bg-white rounded-xl transition-all shadow-none"
                    >
                        <FaPaperclip size={18} />
                    </button>
                    {attachments.length > 0 && (
                        <div className="flex items-center gap-2">
                            {attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <FaFileAlt className="text-green-500" size={10} />
                                <span className="text-[10px] font-bold text-slate-600 truncate max-w-[80px]">{file.fileName}</span>
                                <button type="button" onClick={() => removeAttachment(idx)} className="text-slate-400 hover:text-red-500">
                                <FaTimes size={10} />
                                </button>
                            </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="flex items-center gap-2 bg-[#3c8dbc] border border-[#367fa9] text-white px-6 py-1.5 rounded-sm text-xs font-normal transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                >
                    <FaPaperPlane size={12} /> 
                    {loading ? "Sending..." : "Send"}
                </button>
            </div>
          </form>
          <div className="flex items-center justify-between mt-3 px-2">
            <p className="text-[10px] text-slate-400 font-medium">
                SLA Deadline: <span className="text-slate-600">{moment(ticket.slaDeadline).format("MMM DD, h:mm A")}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketChat;
