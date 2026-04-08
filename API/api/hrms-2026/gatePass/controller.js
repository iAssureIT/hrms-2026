const GatePass = require("./model.js");
const mongoose = require("mongoose");
const { Types: { ObjectId } } = mongoose;
const moment = require("moment");

exports.createGatePass = async (req, res) => {
    console.log("DEBUG [createGatePass] Received payload:", req.body);
    try {
        const lastPass = await GatePass.findOne({}, {}, { sort: { 'createdAt': -1 } });
        let nextNumber = 1;
        if (lastPass && lastPass.passNo) {
            const parts = lastPass.passNo.split("-");
            if (parts.length === 3) {
                nextNumber = parseInt(parts[2]) + 1;
            }
        }
        const passNo = `AGP-${moment().format("YYYY")}-${nextNumber.toString().padStart(5, "0")}`;

        const gatePass = new GatePass({
            ...req.body,
            passNo: passNo,
            status: "Pending"
        });

        console.log("DEBUG [createGatePass] Saving gatePass:", gatePass);
        const result = await gatePass.save();
        res.status(201).json({ success: true, message: "Gate Pass Request Submitted for Approval", data: result });
    } catch (error) {
        console.error("DEBUG [createGatePass] Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getGatePassList = async (req, res) => {
    try {
        const { center_id, status, searchText, pageNumber = 1, recsPerPage = 10 } = req.body;
        const query = {};

        if (center_id && center_id !== "all") query.center_id = new ObjectId(center_id);
        
        if (status && status !== "all") {
            query.status = status;
        }

        if (searchText && searchText !== "-") {
            query.$or = [
                { passNo: { $regex: searchText, $options: "i" } },
                { "bearerDetails.fullName": { $regex: searchText, $options: "i" } },
                { "assets.assetName": { $regex: searchText, $options: "i" } }
            ];
        }

        const skip = (parseInt(pageNumber) - 1) * parseInt(recsPerPage);
        
        const passes = await GatePass.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(recsPerPage));

        const totalRecs = await GatePass.countDocuments(query);

        res.status(200).json({ success: true, tableData: passes, totalRecs: totalRecs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getGatePassDetails = async (req, res) => {
    try {
        const pass = await GatePass.findById(req.params.id);
        if (!pass) return res.status(404).json({ success: false, message: "Gate Pass not found" });
        res.status(200).json({ success: true, data: pass });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateGatePass = async (req, res) => {
    try {
        const pass = await GatePass.findById(req.params.id);
        if (!pass) return res.status(404).json({ success: false, message: "Gate Pass not found" });
        
        if (pass.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Cannot edit an approved/rejected gate pass" });
        }

        const updateData = { ...req.body };
        delete updateData.updateLog;

        const result = await GatePass.findByIdAndUpdate(req.params.id, {
            ...updateData,
            $push: { updateLog: { updatedBy: req.body.user_id, updatedAt: new Date() } }
        }, { new: true });

        res.status(200).json({ success: true, message: "Gate Pass Updated Successfully", data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteGatePass = async (req, res) => {
    try {
        const pass = await GatePass.findById(req.params.id);
        if (!pass) return res.status(404).json({ success: false, message: "Gate Pass not found" });

        if (pass.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Cannot delete an approved/rejected gate pass" });
        }

        await GatePass.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Gate Pass Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.approveGatePass = async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData.updateLog;

        const result = await GatePass.findByIdAndUpdate(req.params.id, {
            status: "Approved",
            ...updateData,
            $push: { updateLog: { updatedBy: req.body.user_id, updatedAt: new Date() } }
        }, { new: true });
        res.status(200).json({ success: true, message: "Gate Pass Approved", data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.rejectGatePass = async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData.updateLog;

        const result = await GatePass.findByIdAndUpdate(req.params.id, {
            status: "Rejected",
            ...updateData,
            $push: { updateLog: { updatedBy: req.body.user_id, updatedAt: new Date() } }
        }, { new: true });
        res.status(200).json({ success: true, message: "Gate Pass Rejected", data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getGatePassMetrics = async (req, res) => {
    try {
        const { center_id } = req.body;
        const query = {};
        if (center_id && center_id !== "all") query.center_id = new ObjectId(center_id);

        const activePasses = await GatePass.countDocuments({ ...query, status: "Approved" });
        const pendingApprovals = await GatePass.countDocuments({ ...query, status: "Pending" });
        const returnedToday = await GatePass.countDocuments({ 
            ...query, 
            status: "Returned", 
            updatedAt: { $gte: moment().startOf('day').toDate() } 
        });
        const rejectedPasses = await GatePass.countDocuments({ ...query, status: "Rejected" });

        res.status(200).json({
            success: true,
            metrics: {
                activePasses,
                pendingApprovals,
                returnedToday,
                rejectedPasses
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
