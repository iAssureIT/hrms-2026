const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
	_id			            : mongoose.Schema.Types.ObjectId,
    masternotificationId   : { type: mongoose.Schema.Types.ObjectId, ref: 'masternotifications', required: true },
    event                  : String,
    toMailId               : String,
    toUserId               : { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    notifBody              : String,
    status                 : String,
    date                   : Date,
    createdAt              : Date,
    createdBy              : { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
});

module.exports = mongoose.model('notifications',notificationSchema);
