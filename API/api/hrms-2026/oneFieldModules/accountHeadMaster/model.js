const mongoose = require('mongoose');

const accountHeadMasterSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fieldValue: { type: String, trim: true, required: true },
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

module.exports = mongoose.model('accountheads', accountHeadMasterSchema);
