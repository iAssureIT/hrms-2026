const Unit = require("./modelNew");
const mongoose = require("mongoose");

exports.createUnit = async (req, res) => {
  console.log("Creating Unit", req.body.formValues);
  try {
    // Check if an activity with the same fieldValue and fieldName already exists
    const existingActivitiy = await Unit.findOne(
      { fieldValue: req.body.fieldValue, }
      
    );

    if (existingActivitiy) {
      // If the activity already exists, send a response indicating duplication
      return res.status(409).json({ message: 'Unit already exists' });
    }
      const unit = new Unit({
        _id: new mongoose.Types.ObjectId(),
        fieldValue: req.body.fieldValue,
        createdBy:req.body.user_id,
        // imageName: req.body.imageName,
        // imageUrl: req.body.imageUrl,
      });
  

  
    const result = await unit.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getUnit = async (req, res) => {
  try {
    const units = await Unit.find();
    // console.log(units);
    res.status(200).json(units);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getUnitData = async (req, res) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  // console.log("req.body => ", req.body);

    Unit.countDocuments()
    .then((totalRecs) => {
      console.log("totalRecs => ", totalRecs);
      Unit
        .find()
        .skip(parseInt(skipRec))
        .limit(parseInt(recsPerPage))
        .sort({ createdAt: -1 })
        .then((data) => {
          res.status(200).json({
            totalRecs: totalRecs,
            tableData: data,
            success: true,
          });
        }) 
        .catch((error) => {
          console.log("Error 1  => ", error);
          res.status(500).json({ errorMsg: error.message, success: false });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};
exports.updateUnit = async (req, res) => {
  console.log(req.body);
  try {
    // Find the existing Unit by ID
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({ error: "Unit not found" });
    }
    const { fieldValue, fieldLableName, imageName, imageUrl, user_id } = req.body;

    const existingActivitiy = await Unit.findOne({
      fieldValue: req.body.fieldValue, 
     _id: { $ne: req.params.id } // Exclude the current activity from the check
   });

   if (existingActivitiy) {
     // If an activity with the same fieldValue and fieldName exists, send a response indicating duplication
     return res.status(409).json({ message: 'Unit with the same name already exists' });
   }

   let updated =false;
   if (unit.fieldValue !== fieldValue) {
    unit.fieldValue = fieldValue;
    updated = true;
}
if (unit.imageName !== imageName) {
    unit.imageName = imageName;
    updated = true;
}
if (unit.imageUrl !== imageUrl) {
    unit.imageUrl = imageUrl;
    updated = true;
}

if (updated) {
    unit.updateLog.push({
        updatedBy: user_id,
        updatedAt: new Date(),
    });

    const result = await unit.save();
    return res.status(200).json({ result, updated: true });
} else {
    return res.status(200).json({ message: 'No changes detected', updated: false });
}
} catch (error) {
res.status(500).json({ error });
}

  //   const newFieldValue = req.body;
  //   unit.fieldValue = `${newFieldValue.fieldValue}`;
    
  //   unit.updateLog.push({
  //     updatedBy:newFieldValue.user_id,
  //     updatedAt:new Date(),
  // })
  //   const result = await unit.save();
  //   res.status(200).json(result);
  // } catch (error) {
  //   res.status(500).json({ error });
  // }
};

exports.deleteUnit = async (req, res) => {
  try {
    await Unit.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Unit deleted" });
  } catch (error) {
    res.status(500).json({ error });
  }
};
