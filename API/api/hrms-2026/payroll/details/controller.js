// controllers/payrollDetailsController.js

const PayrollDetails =
  require("./model");

// CREATE
exports.createPayrollDetails =
  async (
    req,
    res
  ) => {
console.log('------- ',req.body);
    try {

      const {
        payrollMonth,
        payrollDate,
        departments,
        totalEmployees,
        totalPayrollAmount,
        processedBy,
      } = req.body;

      const payroll =
        await PayrollDetails.create({
          payrollMonth,
          payrollDate,
          departments,
          totalEmployees,
          totalPayrollAmount,
          processedBy,
        });

      res.status(201).json({
        success: true,
        message:
          "Payroll details stored successfully",
        data: payroll,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to store payroll details",
      });
    }
  };

// GET ALL
exports.getPayrollDetails =
  async (
    req,
    res
  ) => {

    try {

      const payrolls =
        await PayrollDetails.find()
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        data: payrolls,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch payroll details",
      });
    }
  };

// GET SINGLE
exports.getPayrollDetailsById =
  async (
    req,
    res
  ) => {

    try {

      const payroll =
        await PayrollDetails.findById(
          req.params.id
        );

      if (!payroll) {

        return res.status(404).json({
          success: false,
          message:
            "Payroll details not found",
        });
      }

      res.status(200).json({
        success: true,
        data: payroll,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch payroll details",
      });
    }
  };