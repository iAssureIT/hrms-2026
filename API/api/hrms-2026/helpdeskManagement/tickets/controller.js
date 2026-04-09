const Ticket = require("./model");
const TicketHistory = require("../ticketHistory/model");
const moment = require("moment");

// Helper to generate TKT-XXXX ID
const generateTicketID = async () => {
  try {
    const lastTicket = await Ticket.findOne().sort({ createdAt: -1 });
    if (!lastTicket || !lastTicket.ticketID) {
      return "TKT-1001";
    }
    const parts = lastTicket.ticketID.split("-");
    const numericPart = parseInt(parts[1]);
    if (isNaN(numericPart)) return "TKT-1001";
    return `TKT-${numericPart + 1}`;
  } catch (err) {
    console.error("Error generating ticket ID:", err);
    return "TKT-1001";
  }
};

// SLA calculation
const getSLADeadline = (priority) => {
  const now = moment();
  switch (priority) {
    case "Urgent":
      return now.add(8, "hours").toDate();
    case "High":
      return now.add(24, "hours").toDate();
    case "Medium":
      return now.add(48, "hours").toDate();
    case "Low":
      return now.add(72, "hours").toDate();
    default:
      return now.add(48, "hours").toDate();
  }
};

// ✅ CREATE TICKET
exports.createTicket = async (req, res) => {
  try {
    const { employeeId, subject, category, priority, description, attachments, createdBy } = req.body;

    // Validate IDs
    if (!employeeId || !moment(employeeId).isValid && typeof employeeId !== 'string') {
        // Just checking if it exists for now
    }

    const ticketID = await generateTicketID();
    const slaDeadline = getSLADeadline(priority);

    const ticket = await Ticket.create({
      ticketID,
      employeeId,
      subject,
      category,
      priority,
      description,
      attachments,
      slaDeadline,
      createdBy: createdBy || employeeId,
    });

    // Record History
    await TicketHistory.create({
      ticketId: ticket._id,
      action: "Created",
      details: `Ticket created with ID ${ticketID}`,
      performedBy: createdBy || employeeId,
    });

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    console.error("CREATE TICKET ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET ALL TICKETS (with filters)
exports.listTickets = async (req, res) => {
  try {
    const { status, category, priority, employeeId } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (employeeId) query.employeeId = employeeId;

    const tickets = await Ticket.find(query)
      .populate("employeeId")
      .populate("assignedTo")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET SINGLE TICKET
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("employeeId")
      .populate("assignedTo");
    
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ASSIGN TICKET
exports.assignTicket = async (req, res) => {
  try {
    const { assignedTo, performedBy } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo, 
        assignedAt: new Date(),
        status: "In Progress" 
      },
      { new: true }
    );

    await TicketHistory.create({
      ticketId: ticket._id,
      action: "Assigned",
      details: `Ticket assigned to admin/HR`,
      performedBy: performedBy,
    });

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE STATUS
exports.updateStatus = async (req, res) => {
  try {
    const { status, performedBy } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    await TicketHistory.create({
      ticketId: ticket._id,
      action: "Status Updated",
      details: `Status changed to ${status}`,
      performedBy: performedBy,
    });

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
