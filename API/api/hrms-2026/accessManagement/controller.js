const mongoose = require("mongoose");
const RolePermission = require("./model.js");
const {updateRolePermissions} = require("../../socket.js");

exports.create_accessPermission = (req, res, next) => {
    

    // Check if the role already exists in the database
    RolePermission.findOne({ role: req.body.role })
        .then(existingRolePermission => {
            let rolePermission;

            if (existingRolePermission) {
                // If role exists, update the permissions
                // existingRolePermission.permissions = req.body.modulePermissions;
                // rolePermission = existingRolePermission;
                res.status(200).json({
                    duplicated: true,
                    message: 'Role Permission already exists'
                });
            } else {
                // If role doesn't exist, create a new entry
                rolePermission = new RolePermission({
                    _id: new mongoose.Types.ObjectId(),
                    role: req.body.role,
                    permissions: req.body.modulePermissions,
                    createdBy: req.body.user_id,
                    createdAt: new Date(),
                });
                rolePermission.save()
                    .then(savedRolePermission => {
                        updateRolePermissions(req.body.role,req.body.modulePermissions)

                        // console.log("Inserted/Updated Role Permission => ", savedRolePermission);
                        res.status(200).json({
                            message: 'Permissions saved successfully',
                            savedRolePermission: savedRolePermission,
                            success: true
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            }
            // Save the role permissions to the database
        })
        .catch(error => {
            
            res.status(500).json({
                message: 'Error saving permissions',
                error: error,
                success: false
            });
        });

};


exports.update_accessPermission = (req, res, next) => {
    // console.log("req.body",req.body)
    RolePermission.updateOne(
        { _id: req.body.id }, 
        {
            $set: {
                role: req.body.role,
                permissions: req.body.modulePermissions,
            },
        }
    )
        .then(data => {
            // console.log("Inside Update data", data)
            if (data.modifiedCount == 1) {
                RolePermission.findOneAndUpdate(
                    { _id: req.body.id }, 
                    {
                        $push: {
                            'updateLog': [{
                                updatedAt: new Date(),
                                updatedBy: req.body.user_id
                            }]
                        }
                    }
                )
                    .then(data => {
                        // console.log("data",data)
                        updateRolePermissions(req.body.role,req.body.modulePermissions)
                        res.status(200).json({
                            message: 'Permissions updated successfully',
                            success: true
                        });
                    })
                    .catch(error => {
                        console.log("Error from update controller => ", error);
                        res.status(500).json({ errorMsg: error.message, success: false })
                    })
            } else {
                res.status(200).json({
                    message: 'Permissions not modified',
                    success: false
                });
            }
        })
        .catch(error => {
            console.log("Error from update controller => ", error);
            res.status(500).json({ errorMsg: error.message, success: false })
        })
};


exports.getList_allRolesPermissions = (req, res, next) => {
    RolePermission.find()
        .then((allRolesPermissions) => {
            const transformedData = [];
            // console.log("allRolesPermissions",allRolesPermissions.length)
            // Collect all roles and assign the _id from the database to each role
            const roles = allRolesPermissions.map(rolePermission => ({
                id: rolePermission._id,  // Using _id from the database
                name: rolePermission.role  // Role name
            }));

            // Transform data to create the role-wise permissions
            allRolesPermissions.forEach(rolePermission => {
                rolePermission.permissions.forEach(permission => {
                    // Find or create a module entry
                    let moduleEntry = transformedData.find(entry => entry.moduleName === permission.moduleName);

                    if (!moduleEntry) {
                        moduleEntry = { moduleName: permission.moduleName, permissions: [] };
                        transformedData.push(moduleEntry);
                    }

                    // Update permissions for each module
                    ["create", "view", "list", "edit", "delete", "all"].forEach(perm => {
                        let permEntry = moduleEntry.permissions.find(p => p.permission === perm);

                        if (!permEntry) {
                            permEntry = { permission: perm };
                            roles.forEach(role => {
                                permEntry[role.name] = false;  // Initialize each role permission to false
                            });
                            moduleEntry.permissions.push(permEntry);
                        }

                        // Assign the permission value (true/false) to the correct role
                        permEntry[rolePermission.role] = permission[perm];
                    });
                });
            });
            // console.log("transformedData",transformedData,roles)
            // Return the transformed data and roles with their IDs and names
            res.status(200).json({
                roleWisePermissions: transformedData,  // The transformed permission data
                allRoles: roles,  // Array of roles with {id, name}
                success: true
            });
        })
        .catch((error) => {
            console.log(" error: error.message", error)
            res.status(500).json({ message: "Error while getting roles permissions", error: error.message });
        });
};

exports.getListByRoles = (req, res, next) => {
    RolePermission.find({ role: { $in: req.body.roles } }, { updateLog: 0 })
        .then((rolesPermissions) => {
          
            // console.log("transformedData",transformedData,roles)
            // Return the transformed data and roles with their IDs and names
            res.status(200).json({
                roleWisePermissions: rolesPermissions,  // The transformed permission data
                success: true
            });
        })
        .catch((error) => {
            console.log(" error: error.message", error)
            res.status(500).json({ message: "Error while getting roles permissions", error: error.message });
        });
};

exports.fetch_Access_ID = (req, res, next) => {
    
    RolePermission.findOne({ _id: req.params.ID })

        .then((data) => {
            if (data) {

                
                res.status(200).json(data);
            } else {
                res.status(200).json({ message: "ACCESS_NOT_FOUND" });
            }
        })
        .catch((err) => {
            
            res.status(500).json({
                error: err,
            });
        });
};

exports.fetch_All_Access = (req, res, next) => {
    RolePermission.find()
        .then((data) => {
            if (data && data.length > 0) {

                res.status(200).json(data);
            } else {

                res.status(200).json({ message: "NO_ACCESS_FOUND" });
            }
        })
        .catch((err) => {
            
            
            res.status(500).json({
                error: err,
            });
        });
};

exports.delete_accessPermission = (req, res, next) => {
    

    RolePermission.findOneAndDelete({ _id: req.params.ID })
        .then(deletedRolePermission => {
            if (deletedRolePermission) {
                
                res.status(200).json({
                    message: 'Role permissions deleted successfully',
                    deletedRolePermission: deletedRolePermission,
                    success: true
                });
            } else {
                res.status(404).json({
                    message: 'Role not found',
                    success: false
                });
            }
        })
        .catch(error => {
            
            res.status(500).json({
                message: 'Error deleting permissions',
                error: error.message,
                success: false
            });
        });
};
