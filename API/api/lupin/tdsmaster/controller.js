const mongoose = require("mongoose");
const Section = require("./model");


// ================= CREATE =================
exports.createTdsMaster = async (req, res) => {
  try {
    const { sectionCode, sectionName, tdsRate } = req.body;

    if (!sectionCode?.trim() || !sectionName?.trim() || tdsRate === undefined || tdsRate === "") {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check duplicate sectionCode
    const existing = await Section.findOne({ sectionCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Section Code already exists",
      });
    }

    const section = await Section.create({
      sectionCode,
      sectionName,
      tdsRate,
    });

    res.status(201).json({
      success: true,
      message: "TDS Master Created Successfully",
      data: section,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};



// ================= GET WITH AGGREGATION =================
exports.getTdsMaster = async (req, res) => {
  try {

    let { page = 1, limit = 5, search = "" } = req.query;

    page = Number(page);
    limit = Number(limit);

    const matchStage = {
      $match: {
        $or: [
          { sectionCode: { $regex: search, $options: "i" } },
          { sectionName: { $regex: search, $options: "i" } },
        ],
      },
    };

    const aggregation = await Section.aggregate([
      matchStage,

      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          totalCount: [
            { $count: "count" }
          ],
        },
      },
    ]);

    const data = aggregation[0].data;
    const total = aggregation[0].totalCount[0]?.count || 0;

    res.status(200).json({
      success: true,
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};



// ================= UPDATE =================
exports.updateTdsMaster = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const updated = await Section.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "TDS Master Updated Successfully",
      data: updated,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};



// ================= DELETE =================
exports.deleteTdsMaster = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const deleted = await Section.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Deleted Successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
