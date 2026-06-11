const EmployeeSalary = require(
  "./model"
);

// CREATE
exports.createEmployeeSalary = async (
  req,
  res
) => {
  try {
    const { employeeId, salaryData } = req.body;

    const data = new EmployeeSalary({
      employeeId,
      salaryData,
    });

    const saved = await data.save();

    res.status(201).json({
      message: "Salary saved successfully",
      data: saved,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL
exports.getEmployeeSalary = async (
  req,
  res
) => {
  try {
    const data = await EmployeeSalary.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET BY EMPLOYEE ID
exports.getEmployeeSalaryByEmployeeId =
  async (req, res) => {
    try {
      const data =
        await EmployeeSalary.findOne({
          employeeId: req.params.employeeId,
        });

      if (!data) {
        return res.status(404).json({
          message: "Salary not found",
        });
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
