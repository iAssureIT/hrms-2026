const mongoose = require("mongoose");
const Plantation = require("./model.js");
var ObjectId = require("mongodb").ObjectID;

exports.insert_plantation_form = (req, res, next) => {
  // console.log("Inside insert_plantation_form. req.body => ", req.body);

  Plantation.findOne({
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
      farmerName: req.body.farmerName,
      aadharCard: req.body.aadharCard,
    },
    // locationDetails: {
    //   gatKasara: req.body.gatKasara,
    //   village: req.body.village,
    //   block: req.body.block,
    //   district: req.body.district,
    //   state: req.body.state,
    //   country: req.body.country,
    //   latitude: req.body.latitude,
    //   longitude: req.body.longitude,
    //   sitePhotos: req.body.sitePhotos,
    // },
    // plantationDetails: req.body.plantationDetails,
  })
    .exec()
    .then((data) => {
      if (data) {
        res.status(200).json({ message: "Data already exists" });
      } else {
        let plantationDetails = new Plantation({
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
          farmerDetails: {
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
            sitePhotos: req.body.sitePhotos,
          },
          plantationDetails: req.body.plantationDetails,
          createdBy: req.body.createdBy,
          createdAt: new Date()
        });

        plantationDetails
          .save()
          .then((newRec) => {
            // console.log("newRec => ", newRec);
            res.status(200).json({
              success: true,
              data: newRec,
              message: "Plantation Form Inserted Successfully!",
            });
          })
          .catch((error) => {
            console.log("Error during insert_plantation_form => ", error);
            res.status(500).json({
              success: false,
              message: error.message,
            });
          });
      }
    })
    .catch((error) => {
      console.log("Error during insert_plantation_form => ", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    });
};

exports.get_one_plantation_data = (req, res, next) => {
  // console.log("Inside get_one_plantation_data");
  // console.log("req.params = > ", req.params);

  Plantation.findOne({ _id: req.params.plantation_id })
    .then((data) => {
      res.status(200).json({ data: data, success: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.edit_plantation_form = (req, res, next) => {
  // console.log("Inside edit_plantation_form");
  // console.log("req.body = > ", req.body);

  Plantation.updateOne(
    { _id: req.body.plantation_id },
    {
      $set: {
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
          sitePhotos: req.body.sitePhotos,
        },
        plantationDetails: req.body.plantationDetails,
      },
    }
  )
    .then((updatedDoc) => {
      // console.log("updatedDoc => ", updatedDoc);
      res.status(200).json({ data: updatedDoc, success: true });
    })
    .catch((err) => {
      console.log("error while updating plantation record => ", error);
      res.status(500).json({
        error: err,
      });
    });
};

exports.submit_inspection = (req, res, next) => {
  // console.log("Inside submit_inspection req.body = > ", req.body);
  var selector = { _id: req.body.plantation_id };
  var pushQuery = {
    $push: {
      plantationDetails: req.body.plantationDetails,
      updateLog: { updatedBy: req.body.user_id, updatedAt: new Date() },
    },
  };

  // console.log("submit_inspection selector = > ", selector);
  // console.log("submit_inspection pushQuery = > ", pushQuery);

  Plantation.updateOne(selector, pushQuery)
    .then((updatedDoc) => {
      // console.log("updatedDoc => ", updatedDoc);
      res.status(200).json({ data: updatedDoc, success: true });
    })
    .catch((err) => {
      console.log("error while updating plantation record => ", error);
      res.status(500).json({
        error: err,
      });
    });
};

exports.delete_plantation_data = (req, res, next) => {
  // console.log("Inside delete_plantation_data");
  // console.log("req.params = > ", req.params);

  Plantation.deleteOne({ _id: req.params.plantation_id })
    .then((deletedDoc) => {
      // console.log("deletedDoc => ", deletedDoc);
      if (deletedDoc.deletedCount > 0) {
        res.status(200).json({ data: deletedDoc, success: true });
      } else {
        res.status(200).json({ data: deletedDoc, success: false });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.get_species_list_for_center = (req, res, next) => {
  let query = {};

  if (req.params.centerName !== "all") {
    query.centerName = req.params.centerName;
  }
    Plantation.aggregate([
      { $match: query },
      { $unwind: "$plantationDetails" }, // Flatten plantationDetails array
      { $unwind: "$plantationDetails.speciesDetails" }, // Flatten speciesDetails array
      {
        $group: {
          _id: "$plantationDetails.speciesDetails.speciesName",
        },
      },
      {
        $group: {
          _id: null,
          uniqueSpeciesNames: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          _id: 0,
          list: "$uniqueSpeciesNames",
        },
      },
    ])
      .then((result) => {
        console.log("result",result)
        res.status(200).json({ list: result[0]?.list ? result[0]?.list: [], success: true });
      })
      .catch((error) => {
        console.error("Error fetching species list:", error);
        res.status(500).json({ errorMsg: error.message, success: false });
      });
};
exports.get_plantation_list_for_center = (req, res, next) => {
  // console.log("Inside get_plantation_list_for_center");
  // console.log("req.params => ", req.params);

  let query = {};

  if (req.params.centerName !== "all") {
    query.centerName = req.params.centerName;
  }

  Plantation.find(query).sort({createdAt: -1})
    .then((data) => {
      res.status(200).json({ list: data, success: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

exports.list_plantation_with_filters = (req, res, next) => {
  // console.log("req.body", req.body);

  let query = {};

  if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
    query["plantationDetails.plantationDate"] = {
      $gte: req.body.fromDate,
      $lte: req.body.toDate,
    };
  }

  if (req.body.centerName !== "all") query.centerName = req.body.centerName;

  // console.log("query", query);

  Plantation.find(query).sort({createdAt: -1})
    .then((data) => {
      res.status(200).json({
        totalRecs: data.length,
        tableData: data,
        success: true,
      });
    })
    .catch((error) => {
      console.error("Error in plantation report => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    });
};



exports.get_plantation_dates_correction = (req, res, next) => {
  
    Plantation.find({})
    .then((data) => {

      if(data.length>0){
        processData();
        async function processData(){
          for(var i=0; i<data.length; i++){
            let pdArr = data[i].plantationDetails;
            if(pdArr.length>0){
              for(var j=0; j<pdArr.length; j++){
                let pDate = pdArr[j].plantationDate ? pdArr[j].plantationDate : "1/1/2024"; 
                // console.log("pdate => ",pDate);
                let pDateSplit = pDate.split("/");
                let newPdate = pDate;
                if(pDateSplit[2].length === 4){
                  newPdate = pDateSplit[2]+"/"+pDateSplit[1]+"/"+pDateSplit[0];  
                }
                // console.log("newPdate => ",newPdate);
                pdArr[j].plantationDate = newPdate;
              }

              if(j>=pdArr.length){
                let _id = data[i]._id;
                let x = await pdArrUpdateOne(i, _id, pdArr);
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
      console.error("Error in plantation date correction find => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    });
};


const pdArrUpdateOne = (i, _id, pdArr)=>{
  return new Promise(function (resolve, reject) {
      // console.log(i," pdArr => ",pdArr);

      Plantation.updateOne(
        {_id : _id},
        {$set : {plantationDetails : pdArr}}
      )
      .then((updatedRec)=>{
        // console.log("Record "+i+" updated successfully")
        resolve(updatedRec);
      })
      .catch((error)=>{
        console.log("error during date correction updateOne => ", error);
        reject(error);
      })
  });
};

