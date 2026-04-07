const mongoose = require("mongoose");

const { Schema } = mongoose;

/* -------------------- Main Asset Schema -------------------- */

const assetSchema = new Schema(
    {
        assetID: { type: String, required: true, unique: true },
        assetName: { type: String, required: true, trim: true },

        brand: { type: String, trim: true },
        model: { type: String, trim: true },
        serialNo: { type: String, trim: true },
        serialNumber: { type: String, trim: true },

        vendor_id: { type: Schema.Types.ObjectId, ref: "vendors" },
        vendorName: { type: String, trim: true },

        warrantyDate: { type: Date },
        reviewRemarks: { type: String, trim: true },

        category: { type: String, trim: true },
        category_id: { type: Schema.Types.ObjectId, ref: "assetcategorymasters" },

        subCategory: { type: String, trim: true },
        subCategory_id: { type: Schema.Types.ObjectId, ref: "assetsubcategories" },


        purchaseCost: { type: Number },
        purchaseDate: { type: Date },
        residualValue: { type: Number },
        usefulLife: { type: Number }, // in years

        description: { type: String, trim: true },
        invoiceNumber: { type: String, trim: true },

        specifications: [
            {
                label: { type: String, trim: true },
                value: { type: String, trim: true },
            },
            { _id: false }
        ],

        docs: [{ type: String }],

        // Recommended as array (supports multiple images)
        assetImage: [{ url: String, fileName: String }],

        assetStatus: {
            type: String,
            enum: [
                "ASSET_APPROVAL_PENDING",
                "ASSET_APPROVAL_REJECTED",
                "ACTIVE", // after Asset approval and de-allocation
                "INACTIVE",
                "ALLOCATION_APPROVAL_PENDING",
                "ALLOCATED",
                "ALLOCATION_APPROVAL_REJECTED",

                "MAINTENANCE",
                "DISPOSED",
                "REJECTED",
                "MISSING",
            ],
            default: "ASSET_APPROVAL_PENDING",
        },

        assetApprovalLog: [{
            assetApprovalStatus: {
                type: String,

                default: "PENDING",
            },
            requestedBy: { type: Schema.Types.ObjectId, ref: "users" },
            approvedBy: { type: Schema.Types.ObjectId, ref: "users" },
            approvedAt: { type: Date },
            remarks: { type: String, trim: true },
        }],

        /* -------- Location Mapping -------- */
        center_id: { type: Schema.Types.ObjectId, ref: "Centers" },
        centerName: { type: String, trim: true },
        sublocation_id: { type: Schema.Types.ObjectId, ref: "locationSubcategories" },
        sublocationName: { type: String, trim: true },

        department_id: { type: Schema.Types.ObjectId, ref: "departmentmasters" },
        departmentName: { type: String, trim: true },
        subdepartment_id: { type: Schema.Types.ObjectId, ref: "subdepartmentmasters" },
        subdepartmentName: { type: String, trim: true },

        /* -------- Allocation Details -------- */
        employee_id: { type: Schema.Types.ObjectId, ref: "employees" },
        employeeName: { type: String, trim: true },
        employeeEmail: { type: String, trim: true },
        employeeMobile: { type: String, trim: true },
        employeeDesignation: { type: String, trim: true },

        allocationApprovalStatus: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
        allocationApprovalLog: [{
            allocationApprovalStatus: { type: String },
            approvedAt: { type: Date },
            approvedBy: { type: Schema.Types.ObjectId, ref: "users" },
            remarks: { type: String, trim: true }
        }],
        remarks: { type: String, trim: true }, // For inspection remarks during allocation

        createdBy: { type: Schema.Types.ObjectId, ref: "users" },

        updateLog: [
            {
                updatedAt: { type: Date, default: Date.now },
                updatedBy: { type: Schema.Types.ObjectId, ref: "users" },
            },
            { _id: false }
        ],
    },
    { timestamps: { createdAt: true, updatedAt: true } }
);


module.exports = mongoose.model("assetmanagements", assetSchema);
