const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    employeeName: { type: String, trim: true, required: true },
    employeeID: { type: String, trim: true, unique: true },
    employee_id: { type: String, trim: true },
    employeeEmail: { type: String, trim: true, required: true, unique: true },
    employeeMobile: { type: String, trim: true, required: true },
    employeeDesignation: { type: String, trim: true, required: true },
    center_id: { type: mongoose.Schema.Types.ObjectId, ref: 'centers' },
    centerName: { type: String, trim: true },
    subLocation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'location-subcategory' },
    subLocationName: { type: String, trim: true },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'department-master' },
    departmentName: { type: String, trim: true },
    subDepartment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'subdepartment-master' },
    subDepartmentName: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
    updateLog: [
        {
            updatedAt: { type: Date, default: Date.now },
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
        }
    ],
    fileName: { type: String, trim: true },
});

module.exports = mongoose.model('Employees', employeeSchema);
