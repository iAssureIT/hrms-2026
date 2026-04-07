const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    employeeName: { type: String, trim: true, required: true },
    employeeEmail: { type: String, trim: true, required: true, unique: true },
    employeeMobile: { type: String, trim: true, required: true },
    employeeDesignation: { type: String, trim: true, required: true },
    createdAt: { type: Date, default: Date.now },
    updateLog: [
        {
            updatedAt: { type: Date, default: Date.now },
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
        }
    ],
});

module.exports = mongoose.model('Employees', employeeSchema);
