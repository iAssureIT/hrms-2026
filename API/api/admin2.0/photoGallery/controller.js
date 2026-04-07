const mongoose = require("mongoose");
const PhotoGallery = require("./model");
const { ObjectId } = require("mongodb");
const { select } = require("underscore");

exports.insertPhoto = (req, res, next) => {
    console.log("req.body", req.body);
    console.log("req.body.image", req.body.image);
    const photo = new PhotoGallery({
      _id         : new mongoose.Types.ObjectId(),
      name        : req.body.name,
      type        : req.body.type,
      description : req.body.description,
      image       : req.body.image,
      createdBy: req.body.createdBy || null,
      createdAt: new Date(),
    });
    photo
      .save()
      .then((data) => {
        console.log("add data", data);
        res.status(200).json({ created: true, photoID: data._id });
      })
      .catch((err) => {
        console.log("add catch", err);
        res.status(500).json({ error: err });
      });
};

exports.updatePhoto = async (req, res) => {
  
    console.log("req.body", req.body);
    try {
      PhotoGallery.updateOne(
        { _id: req.params._id },
        {
          $set: {
            name        : req.body.name,
            type        : req.body.type,
            description : req.body.description,
            image       : req.body.image,
          },
        }
      )
        .exec()
        .then((data) => {
          if (data.modifiedCount === 1) {
            console.log("data", data);
            res.status(200).json({ created: true, photoID: data._id });
          } else {
            res.status(200).json({ created: false, photoID: data._id });
          }
        })
        .catch((err) => {
          console.log("260 reeor", err);
          res.status(500).json({ error: err });
        });
    } catch (err) {
      console.log("264 reeor", err);
      res.status(500).json({ error: err.message });
    }
};

exports.getPhoto = (req, res, next) => {
  PhotoGallery.findOne({ _id: req.params._id })
    .exec()
    .then((data) => {
      // console.log("data", data)
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.getAllPhotos = (req, res, next) => {
  PhotoGallery.find({})
    .exec()
    .then((data) => {
      console.log("all locations data", data);
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.deletePhoto = (req, res, next) => {
  PhotoGallery.deleteOne({ _id: req.params._id })
    .exec()
    .then((data) => {
      console.log("delete data", data);
      res.status(200).json({ deleted: true });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};

exports.getTypewise = (req, res, next) => {
  console.log(" Input Req.params => ", req.params);
  const type = req.params.id;
  var selector = {};
  if(type==="all"){
    selector = {};
  }else{
    selector = { "type": type };
  }
  PhotoGallery.find(selector)

    .then((data) => {
      console.log("Get One data => ", data);
      if (data) {
        res.status(200).json({
          success: true,
          message: "Record Found Successfully.",
          data: data,
        });
      } else {
        res.status(200).json({
          success: false,
          message: "Data Not Found",
        });
      }
    })
    .catch((error) => {
      console.log("error => ", error);
      res.status(501).json({
        success: false,
        message: "Get List error! - " + error.message,
      });
    });
};

exports.getTypewiseCount = (req, res, next) => {
  // console.log(" Input Req.params => ", req.params);
  var selector = {};
  if(req.params.user_id ==="All"){
    selector = {}
  }else{
    selector = {"createdBy":ObjectId(req.params.user_id)}
  }
  PhotoGallery.aggregate([
    {
      $match : selector
    },							  
    {
      $group :{
        _id:{
          "type"	      							   : "$type",
        },
        "count": { "$sum": 1 }
      }
    },
    {
      $project:{
        _id: 0,
        type    :"$_id.type",
        count   :"$count"
      }
    }
  ])
    .then((data) => {
      console.log("getTypewiseCount=> ", data);
      if (data) {
        const totalCount = data.reduce((total, { count }) => total + count, 0);
        console.log("totalCount=> ", totalCount);
        res.status(200).json({
            success: true,
            totalCount:totalCount,
            data: data,
          });
      } else {
        res.status(200).json({
          success: false,
          message: "Data Not Found",
        });
      }
    })
    .catch((error) => {
      console.log("error => ", error);
      res.status(501).json({
        success: false,
        message: "Get List error! - " + error.message,
      });
    });
};
