const SalaryComponent = require("./model");


// CREATE
exports.createSalaryComponent = async (req, res) => {
  try {
    const {
      sequence,
      component,
      type,
      formula,
      byValue,
      basedOn,
    } = req.body;

    console.log("createSalaryComponent body:", req.body);
    console.log(
      "sequence =>",
      sequence,
      typeof sequence,
      "byValue =>",
      byValue,
      typeof byValue
    );

    const isMissing = (value) =>
      value === undefined || value === null || value === "";

    const parsedSequence = isMissing(sequence)
      ? undefined
      : Number(sequence);
    const parsedByValue = isMissing(byValue)
      ? undefined
      : Number(byValue);

    if (
      parsedSequence === undefined ||
      Number.isNaN(parsedSequence) ||
      isMissing(component) ||
      isMissing(type) ||
      isMissing(formula) ||
      parsedByValue === undefined ||
      Number.isNaN(parsedByValue)
    ) {
      return res.status(400).json({
        message: "All required fields are mandatory",
        missing: {
          sequence: parsedSequence === undefined || Number.isNaN(parsedSequence),
          component: isMissing(component),
          type: isMissing(type),
          formula: isMissing(formula),
          byValue: parsedByValue === undefined || Number.isNaN(parsedByValue),
        },
      });
    }

    const newComponent = new SalaryComponent({
      sequence: parsedSequence,
      component,
      type,
      formula,
      byValue: parsedByValue,
      basedOn,
    });

    const saved = await newComponent.save();

    res.status(201).json({
      message: "Salary component created successfully",
      data: saved,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL
exports.getSalaryComponents = async (req, res) => {
  try {
    const data = await SalaryComponent.find().sort({
      createdAt: -1,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET SINGLE
exports.getSalaryComponentById = async (req, res) => {
  try {
    const data = await SalaryComponent.findById(
      req.params.id
    );

    if (!data) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE
exports.updateSalaryComponent = async (req, res) => {
  try {
    const updated =
      await SalaryComponent.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    if (!updated) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    res.status(200).json({
      message: "Updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// DELETE
exports.deleteSalaryComponent = async (req, res) => {
  try {
    const deleted =
      await SalaryComponent.findByIdAndDelete(
        req.params.id
      );

    if (!deleted) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    res.status(200).json({
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};