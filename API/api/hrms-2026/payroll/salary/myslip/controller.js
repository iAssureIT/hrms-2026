
// GET PAYSLIPS BY YEAR
exports.getSalarySlipsByYear = async (
  req,
  res
) => {
  try {

    const {
      employeeId,
      year,
    } = req.params;

    const data = await SalarySlip.find({
      employeeId,
      salaryMonth: {
        $regex: year,
        $options: "i",
      },
    }).sort({
      salaryMonth: 1,
    });
    res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};