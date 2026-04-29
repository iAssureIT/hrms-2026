const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    employeeName: { type: String, trim: true, required: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    gender: { type: String, trim: true },
    dob: { type: Date },
    profilePhoto: { type: String, trim: true },

    employeeID: { type: String, trim: true, unique: true },
    employee_id: { type: String, trim: true },
    
    // Contact Details
    employeeEmail: { type: String, trim: true, required: true, unique: true },
    personalEmail: { type: String, trim: true },
    employeeMobile: { type: String, trim: true, required: true },
    alternateContact: { type: String, trim: true },
    currentAddress: { type: String, trim: true },
    permanentAddress: { type: String, trim: true },
    isSameAddress: { type: Boolean, default: false },

    // Employment Details
    employeeDesignation: { type: String, trim: true, required: true },
    systemRole: { type: String, trim: true },
    doj: { type: Date },
    employmentType: { type: String, trim: true },
    reportingManager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    reportingManagerName: { type: String, trim: true },
    
    center_id: { type: mongoose.Schema.Types.ObjectId, ref: 'centers' },
    centerName: { type: String, trim: true },
    subLocation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'location-subcategory' },
    subLocationName: { type: String, trim: true },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'department-master' },
    departmentName: { type: String, trim: true },
    subDepartment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'subdepartment-master' },
    subDepartmentName: { type: String, trim: true },

    // Organizational Mapping
    assignedProjects: [{ type: String, trim: true }],
    assignedClients: [{ type: String, trim: true }],

    // Identification Details
    panNumber: { type: String, trim: true },
    aadhaarNumber: { type: String, trim: true },
    passportNumber: { type: String, trim: true },

    // System Access
    username: { type: String, trim: true },
    accessLevel: { type: String, trim: true },
    password: { type: String, trim: true },

    // Additional Info
    skills: [{ type: String, trim: true }],
    certifications: { type: String, trim: true },
    notes: { type: String, trim: true },

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
