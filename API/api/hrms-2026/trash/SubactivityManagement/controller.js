const mongoose = require("mongoose");
const Subactivity = require("./model");

// CREATE
exports.createItem = async (req, res) => {
  const newItem = new Subactivity({
    _id: new mongoose.Types.ObjectId(),
    dropdownvalue: req.body.dropdownvalue,
    inputValue: req.body.inputValue,
    dropdown_id: req.body.dropdown_id,
    dropdownLabel: req.body.dropdownLabel,
    inputLabel: req.body.inputLabel,
    createdBy: req.body.user_id,
  });
  try {
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
exports.getAllItems = async (req, res) => {
  try {
    const items = await Subactivity.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getSubactivitiesByActivity = async (req, res) => {
  try {
    const subactivities = await Subactivity.find({ dropdown_id: req.params.id });
    res.json({ subactivities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
// exports.updateItem = async (req, res) => {
//   const { dropdownvalue, inputValue } = req.body;
//   console.log("body", req.body)
//   try {
//     const updatedItem = await Subactivity.findByIdAndUpdate(
//       req.params.id,
//       {
//         dropdownvalue: req.body.dropdownvalue,
//         inputValue: req.body.inputValue,
//         dropdown_id: req.body.dropdown_id,
//         dropdownLabel: req.body.dropdownLabel,
//         inputLabel: req.body.inputLabel,

//       },
//       { new: true },

//     );
//     updatedItem.updateLog.push({
//       updatedAt: new Date(),
//       updatedBy: req.body.user_id,
//     })
//     if (!updatedItem)
//       return res.status(404).json({ message: "Item not found" });
//     res.json(updatedItem);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };


exports.updateItem = async (req, res) => {
  const { dropdownvalue, inputValue } = req.body;
  console.log("body", req.body);
  
  try {
    const item = await Subactivity.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if values have changed
    const isDropdownValueChanged = item.dropdownvalue !== dropdownvalue;
    const isInputValueChanged = item.inputValue !== inputValue;

    if (isDropdownValueChanged || isInputValueChanged) {
      item.dropdownvalue = dropdownvalue;
      item.inputValue = inputValue;
      item.dropdown_id = req.body.dropdown_id;
      item.dropdownLabel = req.body.dropdownLabel;
      item.inputLabel = req.body.inputLabel;

      item.updateLog.push({
        updatedAt: new Date(),
        updatedBy: req.body.user_id,
      });

      const updatedItem = await item.save();
      res.json({ success: true, updatedItem, message: `Subactivity updated successfully.` });
    } else {
      res.json({ success: false, message: `Subactivity was not changed hence no update.` });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



// exports.updateItem = async (req, res) => {
//   const { dropdownvalue, inputValue } = req.body;
//   console.log("body", req.body);
  
//   try {
//     const item = await Subactivity.findById(req.params.id);
//     if (!item) {
//       return res.status(404).json({ message: "Item not found" });
//     }

//     item.dropdownvalue = req.body.dropdownvalue;
//     item.inputValue = req.body.inputValue;
//     item.dropdown_id = req.body.dropdown_id;
//     item.dropdownLabel = req.body.dropdownLabel;
//     item.inputLabel = req.body.inputLabel;

//     item.updateLog.push({
//       updatedAt: new Date(),
//       updatedBy: req.body.user_id,
//     });

//     const updatedItem = await item.save();
//     res.json({success:true,updatedItem});
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };


// DELETE
exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await Subactivity.findByIdAndDelete(req.params.id);
    if (!deletedItem)
      return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateDropdownItem = async (req, res) => {
  const newdropdownvalue = req.body[0];
  const dropdownId = req.params.id;

  try {
    const result = await Subactivity.updateMany(
      { dropdown_id: dropdownId },
      { $set: { dropdownvalue: newdropdownvalue } },
      { new: true },

    );
    //   result.updateLog.push({
    //     updatedAt:new Date(),
    //     updatedBy:req.body.user_id,

    // })
    if (result) {
      // console.log("Document updated:", result);
    } else {
      console.log("No document found with the given dropdown_id");
    }
  } catch (err) {
    console.error("Error updating document:", err);
  }
};


