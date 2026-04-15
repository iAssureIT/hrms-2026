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
        
        // Exclude internal MongoDB fields from the update payload
        const clean = (obj) => {
            if (!obj || typeof obj !== 'object') return obj;
            const newObj = { ...obj };
            delete newObj._id;
            delete newObj.__v;
            delete newObj.createdAt;
            delete newObj.updatedAt;
            return newObj;
        };

        let settings = await SystemConfiguration.findOne();
        
        if (!settings) {
            settings = new SystemConfiguration(clean(updateData));
        } else {
            // Safely merge sections if they exist in the update payload
            const sections = ['attendance', 'leave', 'payroll', 'notifications', 'general'];
            
            sections.forEach(section => {
                if (updateData[section]) {
                    const currentSectionData = settings[section] 
                        ? (settings[section].toObject ? settings[section].toObject() : settings[section]) 
                        : {};
                    
                    // Merge existing data with incoming updates, cleaning internal fields
                    settings[section] = { 
                        ...currentSectionData, 
                        ...clean(updateData[section]) 
                    };
                }
            });

            if (updateData.updatedBy) {
                settings.updatedBy = updateData.updatedBy;
            }
        }

        await settings.save();
        res.status(200).json({ message: "Settings updated successfully", settings });
    } catch (error) {
        console.error("SYSTEM_SETTINGS_UPDATE_ERROR:", error);
        res.status(500).json({ 
            message: "Error updating settings", 
            error: error.message,
            details: error.name === 'ValidationError' ? error.errors : undefined
        });
    }
};
