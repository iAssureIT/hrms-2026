const mongoose = require("mongoose");
const Employees = require('./model');
const CenterDetails = require("../centers/model.js");
const LocationSubcategory = require("../oneFieldModules/locationSubcategory/model.js");
const DepartmentMaster = require("../oneFieldModules/departmentMaster/model.js");
const SubdepartmentMaster = require("../oneFieldModules/subdepartmentMaster/model.js");
const FailedRecords = require("../failedRecords/model.js");

exports.upsertEmployee = async (req, res) => {
    const { 
        _id, employeeName, firstName, lastName, gender, dob, profilePhoto,
        employeeID, employee_id, 
        employeeEmail, personalEmail, employeeMobile, alternateContact, currentAddress, permanentAddress, isSameAddress,
        employeeDesignation, systemRole, doj, employmentType, reportingManager_id, reportingManagerName,
        center_id, centerName, subLocation_id, subLocationName,
        department_id, departmentName, subDepartment_id, subDepartmentName,
        assignedProjects, assignedClients,
        panNumber, aadhaarNumber, passportNumber,
        username, accessLevel, password,
        skills, certifications, notes
    } = req.body;

    try {
        if (_id) {
            // --- EDIT MODE ---
            
            // 1. Check if ANOTHER employee has the same employeeID
            if (employeeID && employeeID !== "-") {
                const idExists = await Employees.findOne({ 
                    employeeID: employeeID, 
                    _id: { $ne: _id } 
                });
                if (idExists) {
                    return res.status(409).json({ 
                        message: `Employee ID "${employeeID}" is already assigned to ${idExists.employeeName}.` 
                    });
                }
            }

            // 2. Check if ANOTHER employee has the same employeeEmail
            if (employeeEmail) {
                const emailExists = await Employees.findOne({ 
                    employeeEmail: employeeEmail, 
                    _id: { $ne: _id } 
                });
                if (emailExists) {
                    return res.status(409).json({ 
                        message: `Email "${employeeEmail}" is already assigned to ${emailExists.employeeName}.` 
                    });
                }
            }

            // 3. Update the record
            const updatedData = await Employees.findOneAndUpdate(
                { _id: _id },
                {
                    $set: {
                        employeeName,
                        firstName,
                        lastName,
                        gender,
                        dob,
                        profilePhoto,
                        employeeID,
                        employee_id,
                        employeeEmail,
                        personalEmail,
                        employeeMobile,
                        alternateContact,
                        currentAddress,
                        permanentAddress,
                        isSameAddress,
                        employeeDesignation,
                        systemRole,
                        doj,
                        employmentType,
                        reportingManager_id: reportingManager_id || null,
                        reportingManagerName,
                        center_id: center_id || null,
                        centerName,
                        subLocation_id: subLocation_id || null,
                        subLocationName,
                        department_id: department_id || null,
                        departmentName,
                        subDepartment_id: subDepartment_id || null,
                        subDepartmentName,
                        assignedProjects,
                        assignedClients,
                        panNumber,
                        aadhaarNumber,
                        passportNumber,
                        username,
                        accessLevel,
                        password,
                        skills,
                        certifications,
                        notes
                    }
                },
                { new: true }
            );

            if (updatedData) {
                return res.status(200).json({
                    message: "Employee updated successfully",
                    employee_id: updatedData._id
                });
            } else {
                return res.status(404).json({ message: "Employee not found" });
            }

        } else {
            // --- ADD MODE ---

            // 1. Check if ANY employee has the same employeeEmail
            if (employeeEmail) {
                const emailExists = await Employees.findOne({ employeeEmail: employeeEmail });
                if (emailExists) {
                    return res.status(409).json({ 
                        message: `Employee with email "${employeeEmail}" already exists (${emailExists.employeeName}).` 
                    });
                }
            }

            // 2. Check if ANY employee has the same employeeID
            if (employeeID && employeeID !== "-") {
                const idExists = await Employees.findOne({ employeeID: employeeID });
                if (idExists) {
                    return res.status(409).json({ 
                        message: `Employee ID "${employeeID}" already exists (${idExists.employeeName}).` 
                    });
                }
            }

            // 3. Create new record
            const newEmployee = new Employees({
                _id: new mongoose.Types.ObjectId(),
                employeeName,
                firstName,
                lastName,
                gender,
                dob,
                profilePhoto,
                employeeID,
                employee_id,
                employeeEmail,
                personalEmail,
                employeeMobile,
                alternateContact,
                currentAddress,
                permanentAddress,
                isSameAddress,
                employeeDesignation,
                systemRole,
                doj,
                employmentType,
                reportingManager_id: reportingManager_id || null,
                reportingManagerName,
                center_id: center_id || null,
                centerName,
                subLocation_id: subLocation_id || null,
                subLocationName,
                department_id: department_id || null,
                departmentName,
                subDepartment_id: subDepartment_id || null,
                subDepartmentName,
                assignedProjects,
                assignedClients,
                panNumber,
                aadhaarNumber,
                passportNumber,
                username,
                accessLevel,
                password,
                skills,
                certifications,
                notes
            });

            const savedData = await newEmployee.save();
            return res.status(200).json({
                message: "Employee added successfully",
                employee_id: savedData._id
            });
        }
    } catch (err) {
        console.error("Upsert Employee Error:", err);
        return res.status(500).json({
            error: err.message || err
        });
    }
};

exports.bulkUpload = async (req, res) => {
    try {
        const { data: excelData, fileName, createdBy } = req.body;
        if (!Array.isArray(excelData)) {
            return res.status(400).json({ message: "Invalid data format. Expected an array." });
        }

        const validData = [];
        const invalidData = [];
        const emailSet = new Set();
        const empIdSet = new Set();

        for (let row of excelData) {
            let remark = "";
            
            // 1. Mandatory Fields Check
            if (!row.employeeName || row.employeeName === "-") remark += "Name missing, ";
            if (!row.employeeEmail || row.employeeEmail === "-") remark += "Email missing, ";
            if (!row.employeeMobile || row.employeeMobile === "-") remark += "Mobile missing, ";
            if (!row.employeeDesignation || row.employeeDesignation === "-") remark += "Designation missing, ";
            if (!row.employeeID || row.employeeID === "-") remark += "Employee ID missing, ";

            if (remark) {
                invalidData.push({ ...row, failedRemark: remark.trim().replace(/,$/, "") });
                continue;
            }

            // 2. Duplicate Check in File
            if (emailSet.has(row.employeeEmail)) {
                invalidData.push({ ...row, failedRemark: "Duplicate email in file" });
                continue;
            }
            emailSet.add(row.employeeEmail);

            if (row.employeeID && empIdSet.has(row.employeeID)) {
                invalidData.push({ ...row, failedRemark: "Duplicate Employee ID in file" });
                continue;
            }
            if (row.employeeID) empIdSet.add(row.employeeID);

            // 3. Duplicate Check in Database
            const emailExists = await Employees.findOne({ employeeEmail: row.employeeEmail });
            if (emailExists) {
                invalidData.push({ ...row, failedRemark: "Email already exists in system" });
                continue;
            }

            if (row.employeeID) {
                const idExists = await Employees.findOne({ employeeID: row.employeeID });
                if (idExists) {
                    invalidData.push({ ...row, failedRemark: "Employee ID already exists in system" });
                    continue;
                }
            }

            // 4. Master Data Validation
            let center_id = null;
            if (row.centerName && row.centerName !== "-") {
                const center = await CenterDetails.findOne({ centerName: new RegExp(`^${row.centerName.trim()}$`, "i") });
                if (center) center_id = center._id;
                else remark += "Center not found, ";
            }

            let dept_id = null;
            if (row.departmentName && row.departmentName !== "-") {
                const dept = await DepartmentMaster.findOne({ fieldValue: new RegExp(`^${row.departmentName.trim()}$`, "i") });
                if (dept) dept_id = dept._id;
                else remark += "Department not found, ";
            }

            let subLoc_id = null;
            if (row.subLocationName && row.subLocationName !== "-" && center_id) {
                const subLoc = await LocationSubcategory.findOne({ 
                    inputValue: new RegExp(`^${row.subLocationName.trim()}$`, "i"),
                    dropdown_id: center_id
                });
                if (subLoc) subLoc_id = subLoc._id;
                else remark += "Sub-Location not found or doesn't match center, ";
            }

            let subDept_id = null;
            if (row.subDepartmentName && row.subDepartmentName !== "-" && dept_id) {
                const subDept = await SubdepartmentMaster.findOne({ 
                    inputValue: new RegExp(`^${row.subDepartmentName.trim()}$`, "i"),
                    dropdown_id: dept_id
                });
                if (subDept) subDept_id = subDept._id;
                else remark += "Sub-Department not found or doesn't match dept, ";
            }

            if (remark) {
                invalidData.push({ ...row, failedRemark: remark.trim().replace(/,$/, "") });
                continue;
            }

            // Add to valid data
            validData.push({
                ...row,
                center_id,
                department_id: dept_id,
                subLocation_id: subLoc_id,
                subDepartment_id: subDept_id,
                _id: new mongoose.Types.ObjectId(),
                fileName: fileName,
                createdAt: new Date()
            });
        }

        console.log("Total Valid Records to save:", validData.length);
        console.log("Total Invalid Records:", invalidData.length);
        
        if (validData.length > 0) {
            console.log("Sample valid record fileName:", validData[0].fileName);
            try {
                await Employees.insertMany(validData, { ordered: false });
                console.log("Successfully inserted valid records.");
            } catch (error) {
                console.error("Error during insertMany:", error.message);
                if (error.writeErrors) {
                    console.error("Number of write errors:", error.writeErrors.length);
                    // Add duplicate errors to invalidData if needed
                    for (let err of error.writeErrors) {
                        const failedRow = validData[err.index];
                        invalidData.push({ ...failedRow, failedRemark: "Duplicate email or ID" });
                        // We also need to save these to FailedRecords
                        await insertFailedRecords(failedRow, fileName, createdBy, "Duplicate email or ID");
                    }
                }
            }
        }

        if (invalidData.length > 0) {
            const failedRecords = {
                FailedRecords: invalidData,
                fileName: fileName,
                totalRecords: invalidData.length
            };
            await insertFailedRecords(failedRecords, req.body.updateBadData);
        }

        res.status(200).json({
            message: "Bulk upload completed successfully",
            success: true,
            completed: true,
            validCount: validData.length,
            invalidCount: invalidData.length
        });

    } catch (error) {
        console.error("Bulk Upload Error:", error);
        res.status(500).json({ error: error.message, success: false });
    }
};

exports.filedetails = async (req, res) => {
    try {
        const { fileName } = req.params;
        const goodrecords = await Employees.find({ fileName: fileName });
        const failedRecordsData = await FailedRecords.findOne({ fileName: fileName });

        res.status(200).json({
            goodrecords: goodrecords,
            failedRecords: failedRecordsData ? failedRecordsData.failedRecords : [],
            totalRecords: goodrecords.length + (failedRecordsData ? failedRecordsData.totalRecords : 0)
        });
    } catch (error) {
        console.error("File Details Error:", error);
        res.status(500).json({ error: error.message, success: false });
    }
};

exports.deleteEmployee = (req, res) => {
    Employees.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: "Employee deleted successfully" }))
        .catch(err => res.status(500).json({ error: err }));
};

exports.getAllEmployees = (req, res) => {
    Employees.find()
        .then(data => res.status(200).json(data))
        .catch(err => res.status(500).json({ error: err }));
};

exports.getOneEmployee = (req, res) => {
    Employees.findOne({ _id: req.params.id })
        .then(data => res.status(200).json(data))
        .catch(err => res.status(500).json({ error: err }));
};

exports.getEmployeeList = (req, res) => {
    const { recsPerPage, pageNumber } = req.params;
    const { searchText, removePagination } = req.body;
    
    // Support both params and body for recsPerPage and pageNumber
    const limit = parseInt(recsPerPage || req.body.recsPerPage) || 10;
    const skip = (parseInt(pageNumber || req.body.pageNumber) - 1) * limit;

    let query = {};
    if (searchText && searchText !== "-") {
        query = {
            $or: [
                { employeeName: { $regex: searchText, $options: "i" } },
                { employeeID: { $regex: searchText, $options: "i" } },
                { employee_id: { $regex: searchText, $options: "i" } },
                { employeeEmail: { $regex: searchText, $options: "i" } },
                { employeeMobile: { $regex: searchText, $options: "i" } },
                { centerName: { $regex: searchText, $options: "i" } },
                { departmentName: { $regex: searchText, $options: "i" } }
            ]
        };
    }

    if (removePagination) {
        Employees.find(query).sort({ createdAt: -1 })
            .then(data => {
                res.status(200).json({
                    tableData: data,
                    totalRecs: data.length
                });
            })
            .catch(err => {
                console.error("Get All Employees Error:", err);
                res.status(500).json({ error: err });
            });
    } else {
        Promise.all([
            Employees.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Employees.countDocuments(query)
        ])
            .then(([data, total]) => {
                res.status(200).json({
                    tableData: data,
                    totalRecs: total
                });
            })
            .catch(err => {
                console.error("Get Employee List Error:", err);
                res.status(500).json({ error: err });
            });
    }
};

var insertFailedRecords = async (invalidData, updateBadData) => {
    return new Promise(function (resolve, reject) {
        FailedRecords.find({ fileName: invalidData.fileName })
            .exec()
            .then((data) => {
                if (data.length > 0) {
                    if (data[0].failedRecords.length > 0) {
                        if (updateBadData) {
                            FailedRecords.updateOne(
                                { fileName: invalidData.fileName },
                                { $set: { failedRecords: [] } }
                            )
                                .then((data) => {
                                    if (data.modifiedCount == 1) {
                                        FailedRecords.updateOne(
                                            { fileName: invalidData.fileName },
                                            {
                                                $set: {
                                                    totalRecords: invalidData.totalRecords
                                                },
                                                $push: { failedRecords: invalidData.FailedRecords },
                                            }
                                        )
                                            .then((data) => {
                                                resolve(data);
                                            })
                                            .catch((err) => {
                                                reject(err);
                                            });
                                    } else {
                                        resolve(0);
                                    }
                                })
                                .catch((err) => {
                                    reject(err);
                                });
                        } else {
                            FailedRecords.updateOne(
                                { fileName: invalidData.fileName },
                                {
                                    $set: {
                                        totalRecords: invalidData.totalRecords
                                    },
                                    $push: { failedRecords: invalidData.FailedRecords },
                                }
                            )
                                .then((data) => {
                                    resolve(data);
                                })
                                .catch((err) => {
                                    reject(err);
                                });
                        }
                    } else {
                        FailedRecords.updateOne(
                            { fileName: invalidData.fileName },
                            {
                                $set: {
                                    totalRecords: invalidData.totalRecords
                                },
                                $push: { failedRecords: invalidData.FailedRecords },
                            }
                        )
                            .then((data) => {
                                resolve(data);
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    }
                } else {
                    const failedRecords = new FailedRecords({
                        _id: new mongoose.Types.ObjectId(),
                        failedRecords: invalidData.FailedRecords,
                        fileName: invalidData.fileName,
                        totalRecords: invalidData.totalRecords,
                        createdAt: new Date(),
                    });

                    failedRecords
                        .save()
                        .then((data) => {
                            resolve(data._id);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            });
    });
};
