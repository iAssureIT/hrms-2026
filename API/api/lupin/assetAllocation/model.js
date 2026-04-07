const mongoose = require("mongoose");
const { Schema } = mongoose;

const assetAllocationSchema = new Schema(
    {
        asset_id: { type: Schema.Types.ObjectId, ref: "assetmanagements" },
        assetID: { type: String, required: true },
        assetName: { type: String, trim: true },

        allocationType: {
            type: String,
            enum: ["ALLOCATE", "DEALLOCATE"],
            required: true,
        },
        employee: [
            {
                name: { type: String, trim: true },
                mobile: { type: String, trim: true },
                email: { type: String, trim: true },
                designation: { type: String, trim: true },
                employee_id: { type: Schema.Types.ObjectId, ref: "employees" },
            }
        ],
        center_id: { type: Schema.Types.ObjectId, ref: "Centers" },
        center: { type: String, trim: true },
        subLocation_id: {
            type: Schema.Types.ObjectId,
            ref: "locationSubcategories",
        },
        subLocation: { type: String, trim: true },

        department_id: {
            type: Schema.Types.ObjectId,
            ref: "departmentmasters",
        },
        department: { type: String, trim: true },

        subDepartment_id: {
            type: Schema.Types.ObjectId,
            ref: "subdepartmentmasters",
        },
        subDepartment: { type: String, trim: true },

        allocationApprovalStatus: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED", "CLOSED"],
            default: "PENDING",
        },

        createdBy: { type: Schema.Types.ObjectId, ref: "users" },
        createdAt: { type: Date, default: Date.now },

        updatedBy: { type: Schema.Types.ObjectId, ref: "users" },
        updatedAt: { type: Date },

        allocationApprovalLog: [
            {
                allocationApprovalStatus: {
                    type: String,
                    enum: ["PENDING", "APPROVED", "REJECTED"],
                },
                approvedAt: { type: Date, default: Date.now },
                approvedBy: { type: Schema.Types.ObjectId, ref: "users" },
            }
        ],

        inspectionRemarks: { type: String, trim: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "asset-allocations",
    assetAllocationSchema
);
