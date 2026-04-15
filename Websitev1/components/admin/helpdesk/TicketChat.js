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
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white border-l border-slate-100 italic font-black uppercase text-[10px] tracking-widest opacity-50">
        Select a ticket to synchronize conversation
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white border-l border-slate-100">
      {/* Ticket Header */}
      <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center shadow-sm z-10 bg-white">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 font-black border-2 border-green-100 shadow-sm">
            {ticket.employeeId?.employeeName?.charAt(0) || "U"}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-extrabold text-slate-800 text-lg tracking-tight uppercase">{ticket.subject}</h3>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm ${
                ticket.status === "Open" ? "bg-green-600 text-white border-green-700 shadow-green-600/20" :
                ticket.status === "In Progress" ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/20" :
                "bg-slate-600 text-white border-slate-700"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === "Open" ? "bg-white animate-pulse" : "bg-white/40"}`}></span>
                {ticket.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-bold">
              <span className="font-black uppercase tracking-widest">{ticket.ticketID}</span>
              <span className="text-slate-200">•</span>
              <span className="font-black text-slate-600 uppercase tracking-tight">{ticket.employeeId?.employeeName}</span>
              <span className="text-slate-200">•</span>
              <span className="px-2 py-0.5 bg-slate-50 rounded-lg text-[9px] font-black uppercase text-slate-400 tracking-wider border border-slate-100">{ticket.category}</span>
            </div>
          </div>
        </div>
        {ticket.status !== "Resolved" && ticket.status !== "Closed" && (
          <button
            onClick={markResolved}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white border-2 border-slate-100 px-6 py-3 rounded-2xl hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-sm group active:scale-95"
          >
            <FaCheckCircle className="text-slate-400 group-hover:text-white transition-colors" size={12} /> Mark Resolved
          </button>
        )}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20">
        <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-8 shadow-xl max-w-2xl animate-in fade-in slide-in-from-left-4 duration-500">
          <p className="text-sm text-slate-700 leading-relaxed font-bold tracking-tight italic">"{ticket.description}"</p>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-[9px] text-slate-300 font-black tracking-widest uppercase">{moment(ticket.createdAt).format("MMM DD, YYYY • h:mm A")}</div>
            {ticket.priority === "Urgent" && (
              <div className="bg-rose-600 text-white text-[9px] px-3 py-1 rounded-lg font-black uppercase animate-pulse border border-rose-700 shadow-lg shadow-rose-500/20 tracking-widest">Urgent Priority</div>
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
        <div className="p-6 bg-white border-t border-slate-100">
          <form onSubmit={handleSendMessage} className="relative bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus-within:ring-8 focus-within:ring-green-500/5 focus-within:border-green-500/20 transition-all shadow-inner group overflow-hidden">
            <textarea
              className="w-full bg-transparent p-6 pr-32 text-sm text-slate-700 placeholder:text-slate-300 outline-none resize-none min-h-[120px] font-bold tracking-tight"
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
            <div className="absolute bottom-4 right-4">
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="flex items-center gap-3 bg-green-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-700 shadow-xl shadow-green-500/20 transition-all disabled:opacity-50 active:scale-95 translate-y-0"
              >
                <FaPaperPlane size={12} /> {loading ? "Synchronizing..." : "Submit Reply"}
              </button>
            </div>
          </form>
          <p className="text-[9px] text-slate-300 mt-3 ml-2 font-black tracking-[0.1em] uppercase italic opacity-70">
            SLA Deadline: {moment(ticket.slaDeadline).format("MMM DD, h:mm A")} ({moment(ticket.slaDeadline).fromNow()})
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketChat;
