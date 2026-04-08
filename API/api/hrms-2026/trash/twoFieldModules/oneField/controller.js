// const Activity = require('./model');
// const mongoose = require('mongoose');

// exports.createActivity = async (req, res) => {
//     console.log('activity : ',req.body);
//     const activity = new Activity({
//         _id: new mongoose.Types.ObjectId(),
//         role: req.body.role,

//     });

//     try {
//         const result = await activity.save();
//         res.status(201).json(result);
//     } catch (error) {
//         res.status(500).json({ error });
//     }
// };

// exports.getActivitys = async (req, res) => {
//     try {
//         const activitys = await Activity.find();
//         res.status(200).json(activitys);
//     } catch (error) {
//         res.status(500).json({ error });
//     }
// };

// exports.updateActivity = async (req, res) => {
//     try {
//         const result = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(500).json({ error });
//     }
// };

// exports.deleteActivity = async (req, res) => {
//     try {
//         await Activity.findByIdAndDelete(req.params.id);
//         res.status(200).json({ message: 'Activity deleted' });
//     } catch (error) {
//         res.status(500).json({ error });
//     }
// };
