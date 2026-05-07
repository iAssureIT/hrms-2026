"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaPaperPlane,
  FaPaperclip,
  FaCheckCircle,
  FaTimes,
  FaFileAlt,
  FaEllipsisV,
  FaRegLightbulb,
  FaRegCommentDots,
  FaHistory,
  FaBolt,
  FaChevronRight,
  FaUser,
} from "react-icons/fa";
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
    const newAttachments = files.map((file) => ({
      fileName: file.name,
      fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
      _file: file,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
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
    if ((!newMessage.trim() && attachments.length === 0) || !ticket) return;

    try {
      setLoading(true);
      
      let uploadedAttachments = [];
      if (attachments.length > 0) {
        const uploadFormData = new FormData();
        attachments.forEach((att) => {
          if (att._file) {
            uploadFormData.append("files", att._file);
          }
        });

        const uploadRes = await axios.post("/api/ticket-upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (uploadRes.data.success) {
          uploadedAttachments = uploadRes.data.data.map(file => ({
            fileName: file.fileName,
            fileUrl: (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3050") + file.fileUrl
          }));
        }
      }

      const res = await axios.post("/api/ticket-messages/send", {
        ticketId: ticket._id,
        senderId: currentUser?.user_id,
        message: newMessage,
        attachments: uploadedAttachments,
      });
      if (res.data.success) {
        setMessages([...messages, { ...res.data.data, senderId: currentUser }]);
        setNewMessage("");
        setAttachments([]);

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
      const res = await axios.patch(
        `/api/tickets/update-status/${ticket._id}`,
        {
          status: "Resolved",
          performedBy: currentUser?.user_id,
        },
      );
      if (res.data.success) {
        onRefresh();
      }
    } catch (err) {
      console.error("Status Update Error:", err.response?.data);
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return "bg-sky-50 text-[#3c8dbc] border-sky-100";
      case "In Progress":
        return "bg-orange-50 text-orange-600 border-orange-100";
      case "Resolved":
      case "Closed":
        return "bg-green-50 text-green-600 border-green-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  if (!ticket) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Premium Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-1.5 lg:hidden text-slate-400 hover:bg-slate-50 rounded-lg transition-all"
          >
            <HiArrowLeft size={18} />
          </button>
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-lg bg-[#3c8dbc] text-white flex items-center justify-center text-base font-bold shadow-sm">
                {ticket.employeeId?.employeeName?.charAt(0) || "E"}
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-bold text-slate-800">{ticket.subject}</h2>
                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] font-medium text-slate-400">
                    <span className="font-bold">TKT-{ticket.ticketID?.split("-")[1] || ticket.ticketID}</span>
                    <span>•</span>
                    <span>{ticket.employeeId?.employeeName}</span>
                    <span>•</span>
                    <span>{ticket.category}</span>
                </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ticket.status !== "Resolved" && (
            <button 
                onClick={markResolved}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
                <FaCheckCircle className="text-green-500" size={13} />
                Mark Resolved
            </button>
          )}
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all">
            <FaEllipsisV size={12} />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#F8FAFC]/20 space-y-6">
        {/* Initial Description as first message */}
        <div className="flex gap-4">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400 shadow-sm overflow-hidden">
                <FaUser size={12} />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[12px] font-bold text-slate-800">{ticket.employeeId?.employeeName}</span>
                    <span className="text-[10px] font-medium text-slate-400">{moment(ticket.createdAt).format("h:mm A, dddd")}</span>
                </div>
                <div className="bg-white border border-slate-100 rounded-lg rounded-tl-none p-4 text-[13px] text-slate-600 leading-relaxed shadow-sm max-w-[70%]">
                    {ticket.description}
                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-slate-50">
                            {ticket.attachments.map((file, fIdx) => {
                                const fullUrl = file.fileUrl?.startsWith("http") 
                                    ? file.fileUrl 
                                    : (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3050") + (file.fileUrl?.startsWith("/") ? "" : "/") + file.fileUrl;
                                return (
                                    <a 
                                        key={fIdx} 
                                        href={fullUrl} 
                                        target="_blank" 
                                        download={file.fileName}
                                        className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-md text-[11px] font-bold text-[#3c8dbc] hover:bg-sky-50 transition-all border border-slate-100"
                                    >
                                        <FaFileAlt size={10} />
                                        {file.fileName}
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {messages.map((msg, idx) => {
          const isMe = msg.senderId?._id === currentUser?.user_id;
          return (
            <div key={idx} className={`flex gap-4 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-[12px] font-bold shadow-sm ${
                isMe ? "bg-[#3c8dbc] text-white" : "bg-white border border-slate-100 text-slate-600"
              }`}>
                {msg.senderId?.profile?.firstname?.charAt(0) || msg.senderId?.username?.charAt(0) || "U"}
              </div>
              <div className={`flex-1 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className={`flex items-center gap-2 mb-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                  <span className="text-[12px] font-bold text-slate-800">{isMe ? "You" : msg.senderId?.username}</span>
                  <span className="text-[10px] font-medium text-slate-400">{moment(msg.createdAt).fromNow()}</span>
                </div>
                <div className={`p-4 text-[13px] leading-relaxed shadow-sm max-w-[70%] ${
                    isMe 
                    ? "bg-[#3c8dbc] text-white rounded-lg rounded-tr-none" 
                    : "bg-white border border-slate-100 text-slate-600 rounded-lg rounded-tl-none"
                }`}>
                  {msg.message}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className={`mt-2 flex flex-wrap gap-2 pt-2 border-t ${isMe ? "border-sky-500" : "border-slate-50"}`}>
                      {msg.attachments.map((file, fIdx) => {
                        const fullUrl = file.fileUrl?.startsWith("http") 
                            ? file.fileUrl 
                            : (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3050") + (file.fileUrl?.startsWith("/") ? "" : "/") + file.fileUrl;
                        return (
                            <a 
                                key={fIdx} 
                                href={fullUrl} 
                                target="_blank" 
                                download={file.fileName}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                    isMe ? "bg-sky-500 text-white hover:bg-sky-400" : "bg-slate-50 text-[#3c8dbc] hover:bg-sky-50 border border-slate-100"
                                }`}
                            >
                            <FaFileAlt size={9} />
                            {file.fileName}
                            </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Sticky Bottom Reply Box */}
      <div className="px-6 py-4 bg-white border-t border-slate-100 sticky bottom-0">
        <div className="flex items-center gap-3">
            <button 
                onClick={() => fileInputRef.current.click()}
                className="p-2.5 text-slate-400 hover:text-[#3c8dbc] hover:bg-sky-50 rounded-lg transition-all flex-shrink-0"
            >
                <FaPaperclip size={18} />
            </button>
            <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg focus-within:bg-white focus-within:border-[#3c8dbc] transition-all overflow-hidden shadow-sm">
                {attachments.length > 0 && (
                  <div className="px-3 py-2 bg-white border-b border-slate-100 flex flex-wrap gap-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-md px-2 py-1 text-[10px] text-[#3c8dbc] font-bold shadow-sm">
                        <FaFileAlt size={9} />
                        <span className="truncate max-w-[120px]">{file.fileName}</span>
                        <button onClick={() => removeAttachment(idx)} className="text-blue-300 hover:text-red-500 transition-colors ml-1">
                          <FaTimes size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <textarea
                    className="w-full px-4 py-3 bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 border-none focus:border-none focus:ring-0 outline-none resize-none min-h-[48px] max-h-[150px] leading-relaxed"
                    placeholder="Type your response here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                        }
                    }}
                />
            </div>

            <button
                onClick={handleSendMessage}
                disabled={loading || (!newMessage.trim() && attachments.length === 0)}
                className="flex items-center justify-center bg-[#3c8dbc] text-white w-[48px] h-[48px] rounded-lg shadow-sm hover:bg-[#367fa9] hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 ml-1"
            >
                <FaPaperPlane size={16} />
            </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default TicketChat;

