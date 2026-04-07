const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  fieldValue  : { type: String, trim: true, required: true },
  imageName   : { type: String, trim: true },
  imageUrl    : { type: String, trim: true },
  createdBY   : { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  createdAt   : { type: Date, default: Date.now() },
  
// //   updateLog: [
//     {
//       updateedBy: { type: mongoose.Schema.Types.ObjectId },
//       updatedAt: { type: Date, default: Date.now() },
//     },
//   ],
});

module.exports = mongoose.model("Category", categorySchema);
