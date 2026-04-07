const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
	_id			: mongoose.Schema.Types.ObjectId,
    role        : { type: String, trim: true, required: true },
    createdAt   : { type: Date, default: Date.now() },
    createdBy   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
});

module.exports = mongoose.model('roles',roleSchema);
