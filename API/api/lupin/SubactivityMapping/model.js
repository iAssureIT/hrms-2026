const mongoose = require('mongoose');

const subactivitySchema = new mongoose.Schema({
    _id           : mongoose.Schema.Types.ObjectId,

    field1_id     : { type: mongoose.Schema.Types.ObjectId, ref: "programs" },
    field1Label   : { type: String, trim: true, required: true },
    field1Value   : { type: String, trim: true, required: true },
    
    field2_id     : { type: mongoose.Schema.Types.ObjectId, ref: "projects" },
    field2Label   : { type: String, trim: true, required: true },
    field2Value   : { type: String, trim: true, required: true },
    
    field3_id     : { type: mongoose.Schema.Types.ObjectId, ref: "activities" },
    field3Label   : { type: String, trim: true, required: true },
    field3Value   : { type: String, trim: true, required: true },
    
    inputLabel    : { type: String, trim: true, required: true },
    inputValue    : { type: String, trim: true, required: true },

    createdAt     : { type: Date, default: Date.now() },
    createdBy     : { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    updateLog     : [
        {
            updatedAt: { type: Date, default: Date.now() },
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
        }
    ],
    fileName: String,
});

module.exports = mongoose.model('subactivitymappings', subactivitySchema);

    // Programs  => 'programs' collection

    // Projects => 'subactvities' collection => unique projects for selected program

    // Activities => 'subactvities' collection => unique Activities for selected program & project
