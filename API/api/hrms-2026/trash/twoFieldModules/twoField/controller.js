const mongoose = require("mongoose");
const Item = require("./modal");

// CREATE
exports.createItem = async (req, res) => {
  const { dropdownValue, inputValue } = req.body;
  const newItem = new Item({
    _id: new mongoose.Types.ObjectId(),
    dropdownValue,
    inputValue,
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
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateItem = async (req, res) => {
  const { dropdownValue, inputValue } = req.body;
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { dropdownValue, inputValue },
      { new: true }
    );
    if (!updatedItem)
      return res.status(404).json({ message: "Item not found" });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteItem = async (req, res) => {
  console.log("Id", req.params.id);
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem)
      return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
