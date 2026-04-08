const mongoose = require('mongoose');

const unitSchema = mongoose.Schema({
	_id			: mongoose.Schema.Types.ObjectId,
    unit  : { type: String, trim: true, required: true },
    createdAt   : { type: Date, default: Date.now() },
    createdBy   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
});

module.exports = mongoose.model('units',unitSchema);
