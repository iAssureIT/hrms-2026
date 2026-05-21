const mongoose = require('mongoose');



const accessSchema = mongoose.Schema({
  role: { type: String, required: true, unique: true }, // Unique role identifier
  permissions: [
      {
        moduleName: { type: String },
        all: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        view: { type: Boolean, default: false },
        list: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false }
      }
  ], // Array of module permissions
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdAt: Date,
  updateLog: [
    {
      updatedAt: Date,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    },
  ],
});

module.exports = mongoose.model('access', accessSchema);