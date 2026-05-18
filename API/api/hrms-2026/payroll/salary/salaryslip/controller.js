const SalarySlip = require(
  "./model"
);


// CREATE SALARY SLIP
exports.createSalarySlip = async (
  req,
  res
) => {
  try {

    const {
      employeeId,
      salaryMonth,
      salaryData,
      totalEarnings,
      totalDeductions,
      netSalary,
    } = req.body;

    // CHECK EXISTING SLIP
    const existingSlip =
      await SalarySlip.findOne({
        employeeId,
        salaryMonth,
      });

    // UPDATE
    if (existingSlip) {

      existingSlip.salaryData = salaryData;
      existingSlip.totalEarnings = totalEarnings;
      existingSlip.totalDeductions = totalDeductions;
      existingSlip.netSalary = netSalary;
      
      const updated = await existingSlip.save();

      return res.status(200).json({
        success: true,
        message:
          "Salary slip updated successfully",
        data: updated,
      });
    }

    // CREATE NEW
    const saved = await SalarySlip.create({
      employeeId,
      salaryMonth,
      salaryData,
      totalEarnings,
      totalDeductions,
      netSalary,
    });

    res.status(201).json({
      success: true,
      message:
        "Salary slip created successfully",
      data: saved,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL SLIPS
exports.getSalarySlips = async (
  req,
  res
) => {
  try {
    const data = await SalarySlip.find();

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};