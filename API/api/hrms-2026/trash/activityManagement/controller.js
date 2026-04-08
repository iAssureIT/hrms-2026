const mongoose	 = require("mongoose");
const Unit = require('./model.js');

exports.create_Unit = (req,res,next)=>{
    // console.log("in units");
    if(req.body.fieldValue){
    	Unit.findOne({unit:req.body.fieldValue})
    		.exec()
    		.then(data =>{
                // console.log("data",data)
    			if(data){
    				res.status(200).json({
                        duplicated : true,
    					message    : 'Unit already exists'
    				});
    			}else{
    				const unit = new Unit({
                        _id         : new mongoose.Types.ObjectId(),
                        unit  : req.body.fieldValue,
                        createdBy   : req.body.user_ID,
                    });
                    unit.save()
                    .then(data=>{
                            res.status(200).json({
                                success : true,
                                message : "Unit added successfully",
                                ID      : data._id
                            });
                        })
                        .catch(err =>{
                            console.log(err);
                            res.status(500).json({
                                success: false,
                                error: err
                            });
                        });
    			}
    		})
    		.catch(err =>{
    			console.log(err);
    			res.status(500).json({
                    success : false,
    				error: err
    			});
    		});
    }else{
        res.status(200).json("Unit is Mandatory");
    }
};
exports.list_Unit = (req,res,next)=>{
    Unit.find()
        .sort({ createdAt: -1 })
        .exec()
        .then(data=>{
            res.status(200).json(data);
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.detail_Unit = (req,res,next)=>{
    Unit.findOne({_id:req.params.ID})
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('Unit not found');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.update_Unit = (req,res,next)=>{ 
    console.log("req.body",req.body);
    if(req.body.fieldValue){
        Unit.findOne({unit:req.body.fieldValue})
    		.exec()
    		.then(data =>{
                console.log("data",data);
    			if(data){
    				return res.status(200).json({
    					message: ' Unit already exists'
    				});
    			}else{
    				Unit.updateOne(
                                { _id:req.body.fieldID},  
                                {
                                    $set:{
                                        "unit" : req.body.fieldValue
                                    }
                                }
                            )
                            .exec()
                            .then(data=>{
                                if(data.modifiedCount === 1){
                                    //res.status(200).json("ROLE_UPDATED");
                                     Unit.updateOne(
                                        { _id:req.body.fieldID},
                                        {
                                            $push:  { 'updateLog' : [{  updatedAt      : new Date(),
                                                                        updatedBy      : req.body.updatedBy 
                                                                    }] 
                                                    }
                                        })
                                        .exec()
                                        .then(data=>{
                                            res.status(200).json({ updated : true });
                                        })
                                }else{
                                     res.status(200).json({ updated : false });
                                }
                            })
                            .catch(err =>{
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
    			}
    		})
    		.catch(err =>{
    			console.log(err);
    			res.status(500).json({
    				error: err
    			});
    		});
    }else{
        res.status(200).json("Unit is Mandatory");
    }
};
exports.delete_Unit = (req,res,next)=>{
    // console.log("req.params.ID ",req.params.ID);
    Unit.deleteOne({_id:req.params.ID})
        .exec()
        .then(data=>{
            // console.log('data ',data);
            if(data.deletedCount === 1){
               res.status(200).json({ deleted : true });
            }else{
               res.status(200).json({ deleted : false });
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.delete_all_Units = (req,res,next)=>{
    Unit.deleteMany({})
        .exec()
        .then(data=>{
            res.status(200).json("All Units deleted");
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
