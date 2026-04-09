const Message = require("./model");

// ✅ SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { ticketId, senderId, message, attachments } = req.body;
    const data = await Message.create({
      ticketId,
      senderId,
      message,
      attachments,
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET MESSAGES BY TICKET
exports.getMessagesByTicket = async (req, res) => {
  try {
    const data = await Message.find({ ticketId: req.params.ticketId })
      .populate("senderId")
      .sort({ createdAt: 1 });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
