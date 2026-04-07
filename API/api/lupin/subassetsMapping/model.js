const mongoose = require('mongoose');

const subassetsSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,

    dropdownvalue: { type: String, trim: true, required: true },
    inputValue: { type: String, trim: true, required: true },

    dropdown_id: { type: mongoose.Schema.Types.ObjectId, ref: "assets" },
    category_imgUrl: { type: String, ref: "assets" },
    dropdownLabel: { type: String, trim: true, required: true },
    subcategoryImgUrl: { type: String, trim: true },
    subcategoryImgName: { type: String, trim: true },
    inputLabel: { type: String, trim: true, required: true },
    createdAt: { type: Date, default: Date.now() },
    createdBY: { type: mongoose.Schema.Types.ObjectId, ref: "users" },

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

module.exports = mongoose.model('subassetsmappings', subassetsSchema);

// Programs  => 'programs' collection

// Projects => 'subactvities' collection => unique projects for selected program

// Activities => 'subactvities' collection => unique Activities for selected program & project
