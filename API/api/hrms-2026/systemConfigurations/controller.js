const SystemConfiguration = require('./model');
const mongoose = require('mongoose');

exports.getSettings = async (req, res) => {
    try {
        let settings = await SystemConfiguration.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = new SystemConfiguration({});
            await settings.save();
        }
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching settings", error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const updateData = req.body;
        let settings = await SystemConfiguration.findOne();
        
        if (!settings) {
            settings = new SystemConfiguration(updateData);
        } else {
            // Deep merge or specific section merge
            if (updateData.attendance) settings.attendance = { ...settings.attendance.toObject(), ...updateData.attendance };
            if (updateData.leave) settings.leave = { ...settings.leave.toObject(), ...updateData.leave };
            if (updateData.payroll) settings.payroll = { ...settings.payroll.toObject(), ...updateData.payroll };
            if (updateData.notifications) settings.notifications = { ...settings.notifications.toObject(), ...updateData.notifications };
            if (updateData.general) settings.general = { ...settings.general.toObject(), ...updateData.general };
            settings.updatedBy = req.body.updatedBy || settings.updatedBy;
        }

        await settings.save();
        res.status(200).json({ message: "Settings updated successfully", settings });
    } catch (error) {
        res.status(500).json({ message: "Error updating settings", error: error.message });
    }
};
