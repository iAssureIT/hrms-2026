const mongoose = require('mongoose');

const columnMappingSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    mappingName: { type: String, required: true }, // e.g., "Biometric Machine v1"
    mappings: [
        {
            excelHeader: { type: String, required: true },
            systemField: { type: String, required: true } // e.g., "employeeID", "inTime", etc.
        }
    ],
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ColumnMappings', columnMappingSchema);
