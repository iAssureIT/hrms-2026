const mongoose = require('mongoose');

// 1. Salary Structure Template (e.g., standard breakdown)
const salaryStructureSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    structureName: { type: String, required: true },
    components: [
        {
            name: { type: String, required: true }, // e.g., Basic, HRA
            type: { type: String, enum: ['Earning', 'Deduction'], required: true },
            calculationType: { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
            value: { type: Number, default: 0 }, // percentage or fixed amount
            baseComponent: { type: String }, // For percentage, e.g., "Basic" or "Gross"
        }
    ],
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// 2. Employee Salary Master (Fixed settings per employee)
const salaryMasterSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employees', required: true },
    structure_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryStructures' },
    grossSalary: { type: Number, required: true },
    
    // Statutory IDs
    panNumber: { type: String },
    pfNumber: { type: String },
    esicNumber: { type: String },
    uanNumber: { type: String },

    // Bank Details
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    accountHolderName: { type: String },

    createdAt: { type: Date, default: Date.now }
});

// 3. Payroll Batch Run
const payrollBatchSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    status: { type: String, enum: ['Draft', 'Approved', 'Paid'], default: 'Draft' },
    totalNetPayout: { type: Number, default: 0 },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    processedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date }
});

// 4. Individual Payroll Record (Snapshot for the month)
const payrollRecordSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PayrollBatches' },
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employees', required: true },
    employeeName: { type: String },
    employeeID: { type: String },
    departmentName: { type: String },

    // Inputs
    paidDays: { type: Number, default: 0 },
    lopDays: { type: Number, default: 0 },
    otHours: { type: Number, default: 0 },

    // Detailed Breakdown
    earnings: [
        { name: String, amount: Number }
    ],
    deductions: [
        { name: String, amount: Number }
    ],

    grossSalary: { type: Number },
    totalDeductions: { type: Number },
    netSalary: { type: Number },

    status: { type: String, enum: ['Draft', 'Approved'], default: 'Draft' },
    createdAt: { type: Date, default: Date.now }
});

const SalaryStructure = mongoose.model('SalaryStructures', salaryStructureSchema);
const SalaryMaster = mongoose.model('SalaryMasters', salaryMasterSchema);
const PayrollBatch = mongoose.model('PayrollBatches', payrollBatchSchema);
const PayrollRecord = mongoose.model('PayrollRecords', payrollRecordSchema);

module.exports = { SalaryStructure, SalaryMaster, PayrollBatch, PayrollRecord };
