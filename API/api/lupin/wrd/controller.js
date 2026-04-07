const mongoose = require("mongoose");
const WRD = require("./model.js");

exports.insert_wrd_form = (req, res, next) => {
  // console.log("Inside insert_wrd_form. req.body => ", req.body);

  WRD.findOne({
    centerName: req.body.centerName,
    program: req.body.program,
    program_id: req.body.program_id,
    project: req.body.project,
    project_id: req.body.project_id,
    activity: req.body.activity,
    activity_id: req.body.activity_id,
    subActivity: req.body.subActivity,
    subActivity_id: req.body.subActivity_id,
    farmerDetails: {
      landType: req.body.landType,
      farmerName: req.body.farmerName,
      aadharCard: req.body.aadharCard,
    },
    // typeOfStructure: req.body.typeOfStructure,
    // locationDetails: {
    //   gatKasara: req.body.gatKasara,
    //   village: req.body.village,
    //   block: req.body.block,
    //   district: req.body.district,
    //   state: req.body.state,
    //   country: req.body.country,
    //   latitude: req.body.latitude,
    //   longitude: req.body.longitude,
    // },
    // wrdDetails: req.body.wrdDetails,
  })
    .exec()
    .then((data) => {
      if (data) {
        res.status(200).json({ message: "Data already exists" });
      } else {
        let wrdDetails = new WRD({
          _id: new mongoose.Types.ObjectId(),
          centerName: req.body.centerName,
          program: req.body.program,
          program_id: req.body.program_id,
          project: req.body.project,
          project_id: req.body.project_id,
          activity: req.body.activity,
          activity_id: req.body.activity_id,
          subActivity: req.body.subActivity,
          subActivity_id: req.body.subActivity_id,

          typeOfStructure: req.body.typeOfStructure,

          farmerDetails: {
            landType: req.body.landType,
            farmerName: req.body.farmerName,
            aadharCard: req.body.aadharCard,
          },
          locationDetails: {
            gatKasara: req.body.gatKasara,
            village: req.body.village,
            block: req.body.block,
            district: req.body.district,
            state: req.body.state,
            country: req.body.country,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
          },
          wrdDetails: req.body.wrdDetails,
          createdBy: req.body.createdBy,
          createdAt: new Date()
        });
        wrdDetails
          .save()
          .then((newRec) => {
            // console.log("WRD newRec => ", newRec);
            res.status(200).json({
              success: true,
              data: newRec,
              message: "WRD Form Inserted Successfully!",
            });
          })
          .catch((error) => {
            // console.log("Error during insert_wrd_form => ", error);
            res.status(500).json({
              success: false,
              message: error.message,
            });
          });
      }
    })
    .catch((error) => {
      // console.log("Error during insert_wrd_form => ", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    });
};

exports.get_one_wrd_data = (req, res, next) => {
  // console.log("Inside get_one_wrd_data");
  // console.log("req.params = > ", req.params);

  WRD.findOne({ _id: req.params.wrd_id })
    .then((data) => {
      res.status(200).json({ data: data, success: true });
    })
    .catch((err) => {
      // console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.edit_wrd_form = (req, res, next) => {
  // console.log("Inside edit_wrd_form");

  WRD.updateOne(
    { _id: req.body.wrd_id },
    {
      $set: {
        centerName: req.body.centerName,
        program: req.body.program,
        project: req.body.project,
        activity: req.body.activity,
        subActivity: req.body.subActivity,
        typeOfStructure: req.body.typeOfStructure,
        farmerDetails: {
          landType: req.body.landType,
          farmerName: req.body.farmerName,
          aadharCard: req.body.aadharCard,
        },
        locationDetails: {
          gatKasara: req.body.gatKasara,
          village: req.body.village,
          block: req.body.block,
          district: req.body.district,
          state: req.body.state,
          country: req.body.country,
          latitude: req.body.latitude,
          longitude: req.body.longitude,
        },
        wrdDetails: req.body.wrdDetails,
      },
    }
  )
    .then((updatedDoc) => {
      // console.log("updatedDoc => ", updatedDoc);
      res.status(200).json({ data: updatedDoc, success: true });
    })
    .catch((err) => {
      // console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.delete_wrd_data = (req, res, next) => {
  // console.log("Inside delete_wrd_data");
  // console.log("req.body = > ", req.body);

  WRD.deleteOne({ _id: req.params.wrd_id })
    .then((deletedDoc) => {
      // console.log("deletedDoc => ", deletedDoc);
      res.status(200).json({ data: deletedDoc, success: true });
    })
    .catch((err) => {
      // console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.get_wrd_list_for_center = (req, res, next) => {
  // console.log("Inside get_wrd_list_for_center");
  // console.log("req.params => ", req.params);

  WRD.find({ centerName: req.params.centerName }).sort({createdAt: -1})
    .then((data) => {      
      res.status(200).json({ list: data, success: true });
    })
    .catch((err) => {
      // console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.submit_inspection = (req, res, next) => {
  // console.log("Inside submit_inspection req.body = > ", req.body);
  var selector = { _id: req.body.wrd_id };
  var pushQuery = {
    $push: {
      wrdDetails: req.body.wrdDetails,
      updateLog: { updatedBy: req.body.user_id, updatedAt: new Date() },
    },
  };

  // console.log("submit_inspection selector = > ", selector);
  // console.log("submit_inspection pushQuery = > ", pushQuery);

  WRD.updateOne(selector, pushQuery)
    .then((updatedDoc) => {
      // console.log("updatedDoc => ", updatedDoc);
      res.status(200).json({ data: updatedDoc, success: true });
    })
    .catch((err) => {
      // console.log("error while updating wrd record => ", err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.list_wrd_with_filters = (req, res, next) => {
  // console.log("req.body", req.body);

  let query = {};

  if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
    query["wrdDetails.constructionDate"] = {
      $gte: req.body.fromDate,
      $lte: req.body.toDate,
    };
  }

  if (req.body.centerName !== "all") query.center_id = req.body.centerName;

  WRD.find(query).sort({createdAt: -1})
    .then((data) => {      
      res.status(200).json({
        totalRecs: data.length,
        tableData: data,
        success: true,
      });
    })
    .catch((error) => {
      // console.error("Error in wrd report => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    });
};





exports.get_wrd_dates_correction = (req, res, next) => {
  
  WRD.find({})
  .then((data) => {

    if(data.length>0){
      processData();
      async function processData(){
        for(var i=0; i<data.length; i++){
          let wrdArr = data[i].wrdDetails;
          if(wrdArr.length>0){
            for(var j=0; j<wrdArr.length; j++){
              let pDate = wrdArr[j].constructionDate ? wrdArr[j].constructionDate : "1/1/2024"; 
              // console.log("pdate => ",pDate);
              let pDateSplit = pDate.split("/");
              let newPdate = pDate;
              if(pDateSplit[2].length === 4){
                newPdate = pDateSplit[2]+"/"+pDateSplit[1]+"/"+pDateSplit[0];  
              }
              // console.log("newPdate => ",newPdate);
              wrdArr[j].constructionDate = newPdate;
            }

            if(j>=wrdArr.length){
              let _id = data[i]._id;
              let x = await wrdArrUpdateOne(i, _id, wrdArr);
            }
          }
        }        
        if(i>=data.length){
          res.status(200).json({
            success: true,
            message: "Processing Completed"
          });  
        }
      }
    }
  })
  .catch((error) => {
    // console.error("Error in wrd date correction find => ", error);
    res.status(500).json({ errorMsg: error.message, success: false });
  });
};


const wrdArrUpdateOne = (i, _id, wrdArr)=>{
return new Promise(function (resolve, reject) {
    // console.log(i," wrdArr => ",wrdArr);

    WRD.updateOne(
      {_id : _id},
      {$set : {wrdDetails : wrdArr}}
    )
    .then((updatedRec)=>{
      // console.log("Record "+i+" updated successfully")
      resolve(updatedRec);
    })
    .catch((error)=>{
      // console.log("error during date correction updateOne => ", error);
      reject(error);
    })
});
};

