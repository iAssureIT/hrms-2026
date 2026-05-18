const mongoose = require("mongoose");

const DepartmentMasterSchema =
  new mongoose.Schema(
    {},
    {
      strict: false,
      collection: "departmentmasters",
    }
  );

module.exports = mongoose.model(
  "DepartmentMaster",
  DepartmentMasterSchema
);
