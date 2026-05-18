const DepartmentMaster = require(
  "./model"
);

// GET ALL DEPARTMENTS
exports.getPayrollDepartments = async (req, res) => {
  try {
    const departments =
      await DepartmentMaster.find().sort({
        department: 1,
      });

    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET EMPLOYEES BY DEPARTMENTS
exports.getEmployeesByDepartments =
  async (req, res) => {
console.log('controller departments', req.body);
    try {

      const { departments } =
        req.body;

      // VALIDATION
      if (
        !departments ||
        !Array.isArray(departments)
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Departments are required",
        });
      }

      // FIND EMPLOYEES
      const employees =
        await Employees.find({
          departmentName: {
            $in: departments,
          },
        }).sort({
          name: 1,
        });

      res.status(200).json({
        success: true,
        count: employees.length,
        data: employees,
      });

    } catch (error) {

      console.log(error);
      console.log('abcd : ', departments);
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };