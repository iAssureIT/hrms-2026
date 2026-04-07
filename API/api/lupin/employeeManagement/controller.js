const mongoose = require("mongoose");
const Employees = require('./model');

exports.upsertEmployee = (req, res) => {
    const { employeeName, employeeEmail, employeeMobile, employeeDesignation } = req.body;

    Employees.findOneAndUpdate(
        { employeeEmail: employeeEmail },
        {
            $set: {
                employeeName,
                employeeEmail,
                employeeMobile,
                employeeDesignation,
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    )
        .then(data => {
            res.status(200).json({
                message: "Employee updated successfully",
                employee_id: data._id
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
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
