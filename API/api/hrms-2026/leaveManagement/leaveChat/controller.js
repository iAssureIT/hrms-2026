const mongoose = require("mongoose");
const LeaveChatLog = require("./model");
const LeaveBalance = require("../leaveBalance/model");
const LeaveLedger = require("../leaveLedger/model");
const LeaveType = require("../leaveTypes/model");
const moment = require("moment");

/**
 * Process chat message and return AI response based on real-time leave data.
 * Hybrid logic: Keywords like "balance", "status", "why lop" trigger direct data summary.
 */
exports.processChat = async (req, res) => {
  try {
    const { employeeId, message } = req.body;
    if (!employeeId || !message) {
      return res.status(400).json({ success: false, message: "Employee ID and message are required." });
    }

    const lowerMsg = message.toLowerCase();
    let aiResponse = "";
    let dataContext = {};

    // 1. Fetch current leave data context
    const year = moment().year();
    const month = moment().month() + 1;

    const balances = await LeaveBalance.find({ employeeId, year }).populate("leaveTypeId");
    const ledger = await LeaveLedger.find({ employeeId, year }).populate("leaveTypeId").sort({ transactionDate: -1 });

    // Format balance data for the context
    const balanceSummary = balances.map(b => ({
      type: b.leaveTypeId?.leaveCode,
      opening: b.openingBalance,
      earned: b.earnedDays,
      used: b.usedDays,
      remaining: b.remainingBalance
    }));

    dataContext = {
      balances: balanceSummary,
      recentTransactions: ledger.slice(0, 5).map(l => ({
        date: moment(l.transactionDate).format("DD MMM YYYY"),
        type: l.leaveTypeId?.leaveCode,
        days: l.days,
        action: l.days > 0 ? "Earned" : "Used",
        remarks: l.remarks,
        adjustedWith: l.adjustedWith
      }))
    };

    // 2. Hybrid Logic - Direct responses for critical queries
    if (lowerMsg.includes("balance") || lowerMsg.includes("how many leave")) {
      const el = balanceSummary.find(b => b.type === "EL")?.remaining || 0;
      const co = balanceSummary.find(b => b.type === "CO")?.remaining || 0;
      const lop = balanceSummary.find(b => b.type === "LOP")?.remaining || 0;
      
      // Calculate Net Balance consistent with UI: EL + CO - LOP
      // Note: In this system, LOP is often shown as a positive 'debt' count in the UI
      const netBalance = (el + co) - Math.abs(lop);
      
      aiResponse = `Your current leave balance for ${year} is:\n- **Earned Leave (EL):** ${el} days\n- **Comp Off (CO):** ${co} days\n- **Loss of Pay (LOP):** ${Math.abs(lop)} days\n\n**Net Balance (EL + CO - LOP):** ${netBalance.toFixed(1)} days.`;
    } 
    else if (lowerMsg.includes("why lop") || lowerMsg.includes("lop reason")) {
      const lopTx = ledger.filter(l => l.leaveTypeId?.leaveCode === "LOP" || l.adjustedWith === "LOP");
      if (lopTx.length > 0) {
        const lastLop = lopTx[0];
        aiResponse = `You have LOP records in your ledger. The most recent one was on ${moment(lastLop.transactionDate).format("DD MMM YYYY")} for ${Math.abs(lastLop.days)} day(s). Reason: "${lastLop.remarks}". \n\nTypically, LOP occurs when your EL and CO balances are exhausted and you take additional leave.`;
      } else {
        aiResponse = "I don't see any LOP (Loss of Pay) records in your ledger for this year. You're all good!";
      }
    }
    else if (lowerMsg.includes("summary") || lowerMsg.includes("usage")) {
      const totalUsed = balanceSummary.reduce((acc, b) => acc + b.used, 0);
      aiResponse = `Here is your leave usage summary for ${year}:\n- Total Leaves Used: ${totalUsed} days.\n- Most used type: ${balanceSummary.sort((a, b) => b.used - a.used)[0]?.type || "N/A"}.\n- Remaining EL: ${balanceSummary.find(b => b.type === "EL")?.remaining || 0} days.`;
    }
    else if (lowerMsg.includes("apply") || lowerMsg.includes("take leave")) {
      aiResponse = "To apply for leave, please click on the **'Apply Leave'** button at the top of the dashboard. You can choose your leave type and dates there.";
    }
    else {
      // General Conversational Response (Simulated AI)
      aiResponse = `Hello! I am your Leave Assistant. I can help you understand your leave balances, usage patterns (EL → CO → LOP), and ledger history. \n\nYou currently have ${balanceSummary.find(b => b.type === "EL")?.remaining || 0} EL and ${balanceSummary.find(b => b.type === "CO")?.remaining || 0} CO left. How can I help you today?`;
    }

    // 3. Log the interaction
    await LeaveChatLog.create({
      employeeId,
      userMessage: message,
      aiResponse,
      dataContext,
      createdAt: new Date()
    });

    res.status(200).json({ success: true, response: aiResponse });

  } catch (err) {
    console.error("Leave Chat Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get chat history for an employee
 */
exports.getChatHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const history = await LeaveChatLog.find({ employeeId }).sort({ createdAt: 1 }).limit(50);
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
