const mongoose = require('mongoose');

const jobTimingSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fieldValue: { type: String, trim: true, required: true }, // Job Timing Name
    createdAt: { type: Date, default: Date.now() },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    updateLog: [
        {
            updatedAt: { type: Date, default: Date.now() },
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
        }
    ],
    fileName: String,
});

module.exports = mongoose.model('job-timing-master', jobTimingSchema);
