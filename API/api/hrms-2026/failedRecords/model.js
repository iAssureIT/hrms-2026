const mongoose = require('mongoose');

const FailedRecordSchema = mongoose.Schema({
	_id			        : mongoose.Schema.Types.ObjectId, 
	totalRecords 		: Number,
    failedRecords       : Array,
    fileName       		: String,
   	createdAt 			: Date
});

module.exports = mongoose.model('failedrecords',FailedRecordSchema);

