const mongoose	= require("mongoose");
const Role      = require('./model.js');
exports.create_role = (req,res,next)=>{
    // console.log("in roles");
    if(req.body.fieldValue){

    	Role.findOne({role:req.body.fieldValue})
    		.exec()
    		.then(data =>{
                // console.log("data",data)
    			if(data){
    				res.status(200).json({
                        duplicated : true,
    					message    : ' Role already exists'
    				});
    			}else{
    				const role = new Role({
                        _id         : new mongoose.Types.ObjectId(),
                        role        : req.body.fieldValue,
                        createdBy   : req.body.user_ID,
                        // createdAt   : new Date(),

                    });
                    role.save()
                    .then(data=>{
                            res.status(200).json({
                                created : true,
                                message : "ROLE_ADDED",
                                ID      : data._id
                            });
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
        res.status(200).json("Role is Madatory");
    }
};
exports.list_role = (req,res,next)=>{
    Role.find()
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
exports.detail_role = (req,res,next)=>{
    Role.findOne({_id:req.params.ID})
        .exec()
        .then(data=>{
            if(data){
                res.status(200).json(data);
            }else{
                res.status(404).json('ROLE_NOT_FOUND');
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
exports.update_role = (req,res,next)=>{ 
    console.log("req.body",req.body);
    if(req.body.fieldValue){
        Role.findOne({role:req.body.fieldValue})
    		.exec()
    		.then(data =>{
                console.log("data",data);
    			if(data){
    				return res.status(200).json({
    					message: ' Role already exists'
    				});
    			}else{
    				Role.updateOne(
                                { _id:req.body.fieldID},  
                                {
                                    $set:{
                                        "role" : req.body.fieldValue
                                    }
                                }
                            )
                            .exec()
                            .then(data=>{
                                if(data.modifiedCount === 1){
                                    //res.status(200).json("ROLE_UPDATED");
                                     Role.updateOne(
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
        res.status(200).json("Role is Madatory");
    }
};
exports.delete_role = (req,res,next)=>{
    // console.log("req.params.ID ",req.params.ID);
    Role.deleteOne({_id:req.params.ID})
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
exports.delete_all_role = (req,res,next)=>{
    Role.deleteMany({})
        .exec()
        .then(data=>{
            res.status(200).json("All Roles deleted");
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};
