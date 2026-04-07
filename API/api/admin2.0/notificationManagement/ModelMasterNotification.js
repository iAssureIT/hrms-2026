const mongoose = require('mongoose');

const masternotificationSchema = mongoose.Schema({
	_id			 : mongoose.Schema.Types.ObjectId,
  templateType : String,	
  dltTemplateId:String,
  event        : String,	
  templateName : String,	
	role		 : String,
	// company 	 : { type: mongoose.Schema.Types.ObjectId, ref: 'entitymasters' },
	subject      : String,
	content      : String,	
	status       : String,	
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdAt: Date,
  updateLog    :   [
    {
        updatedAt   : Date,
        updatedBy   : { type: mongoose.Schema.Types.ObjectId, ref: 'users' } 
    }
  ]
});

module.exports = mongoose.model('masternotifications',masternotificationSchema);
