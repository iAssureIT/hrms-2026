const EmployeeSalary = require(
  "../structure/model"
);

// Get all salary records
exports.getEmployeeSalaryList = async (req, res) => {
  try {
    const salaries = await EmployeeSalary.find({})
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: salaries.length,
      data: salaries,
    });
  } catch (error) {
    console.error("Get Salary List Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch salary records",
      error: error.message,
    });
  }
};

// Delete salary record
exports.deleteEmployeeSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await EmployeeSalary.findById(id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }

    await EmployeeSalary.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Salary record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Salary Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete salary record",
      error: error.message,
    });
  }
};  