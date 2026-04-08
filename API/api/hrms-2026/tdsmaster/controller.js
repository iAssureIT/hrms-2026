const mongoose = require("mongoose");
const Section = require("./model");


// ================= CREATE =================
exports.createTdsMaster = async (req, res) => {
  try {
    let { sectionCode, sectionName, tdsRate } = req.body;

    if (!sectionCode?.trim() || !sectionName?.trim() || tdsRate === undefined || tdsRate === "") {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const rate = Number(tdsRate);

    if (isNaN(rate)) {
      return res.status(400).json({
        success: false,
        message: "TDS Rate must be a valid number",
      });
    }

    // ✅ Check duplicate sectionCode
    const existingSection = await Section.findOne({ sectionCode: sectionCode.trim() });

    if (existingSection) {
      return res.status(409).json({
        success: false,
        message: "Section Code already exists",
      });
    }

    const section = await Section.create({
      sectionCode: sectionCode.trim(),
      sectionName: sectionName.trim(),
      tdsRate: rate,
    });

    res.status(201).json({
      success: true,
      message: "TDS Master Created Successfully",
      data: section,
    });

  } catch (error) {

    // Handle duplicate error fallback
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Section Code already exists",
      });
    }

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
    let {
      page = 1,
      limit = 5,
      search = "",
      removePagination = false,
    } = req.body;

    page = Number(page);
    limit = Number(limit);
    removePagination = Boolean(removePagination);

    const matchStage = {
      $match: {
        $or: [
          { sectionCode: { $regex: search, $options: "i" } },
          { sectionName: { $regex: search, $options: "i" } },
        ],
      },
    };

    // Base pipeline
    const dataPipeline = [
      matchStage,
      { $sort: { createdAt: -1 } },
    ];

    // Apply pagination ONLY if removePagination is false
    if (!removePagination) {
      dataPipeline.push(
        { $skip: (page - 1) * limit },
        { $limit: limit }
      );
    }

    const aggregation = await Section.aggregate([
      {
        $facet: {
          data: dataPipeline,
          totalCount: [
            matchStage,
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
      currentPage: removePagination ? 1 : page,
      totalPages: removePagination
        ? 1
        : Math.ceil(total / limit),
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
