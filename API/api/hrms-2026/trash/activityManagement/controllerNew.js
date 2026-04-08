const Activity = require("./modelNew");
const mongoose = require("mongoose");

exports.createActivity = async (req, res) => {
  console.log("Creating Activity", req.body.formValues);
  const { fieldValue, fieldLableName, imageName, imageUrl, user_id } = req.body;

  try {
    // Check if an activity with the same fieldValue and fieldName already exists
    const existingActivitiy = await activity.findOne({ fieldValue, fieldName: fieldLableName });

    if (existingActivitiy) {
      // If the activity already exists, send a response indicating duplication
      return res.status(409).json({ message: 'Activity already exists' });
    }
  const activity = new Activity({
    _id: new mongoose.Types.ObjectId(),
    fieldValue: req.body.fieldValue,
    // imageName: req.body.imageName,
    // imageUrl: req.body.imageUrl,
  });

  
    const result = await activity.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const activities = await Activity.find();
    console.log(activities);
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.updateActivity = async (req, res) => {
  console.log(req.body);
  try {
    // Find the existing Activity by ID
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const { fieldValue, fieldLableName, imageName, imageUrl, updatedBy } = req.body;

    // Check if an activity with the new fieldValue and fieldName already exists
    const existingActivitiy = await activity.findOne({
      fieldValue,
      fieldName: fieldLableName,
      _id: { $ne: req.params.id } // Exclude the current activity from the check
    });

    if (existingActivitiy) {
      // If an activity with the same fieldValue and fieldName exists, send a response indicating duplication
      return res.status(409).json({ message: 'Activity with the same name already exists' });
    }


    const newFieldValue = req.body;
    activity.fieldValue = `${newFieldValue.fieldValue}`;
    // Activity.imageName = `${newFieldValue.imageName}`;
    // Activity.imageUrl = `${newFieldValue.imageUrl}`;
    const result = await activity.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Activity deleted" });
  } catch (error) {
    res.status(500).json({ error });
  }
};
