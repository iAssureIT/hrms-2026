const mongoose = require("mongoose");

const Centers = require("../centers/model");
const Utilization = require("../utilization-details/model.js");
const AnnualPlan = require("../annual-plan/model.js");
const Approval = require("../approval-details/model.js");
const Plantation = require("../plantation/model.js");
const WRD = require("../wrd/model.js");
const ObjectId = require("mongoose").Types.ObjectId;

exports.getDashboardData = async (req, res, next) => {
  try {
    let query = {};
    let query_1 = {};
    const financialYear = req.params.year;
    const dataType = req.params.dataType;

    // console.log("req.params.center_id", req.params.center_id);

    if (req.params.center_id !== "all") {
      query._id = new ObjectId(req.params.center_id); // Convert string to ObjectId
      query_1.center_id = new ObjectId(req.params.center_id);
    }

    if (financialYear !== "all") {
      const { startDate, endDate } = getFinancialYearDates(financialYear);
      // console.log("startDate, endDate", startDate, endDate);

      if (dataType === "current") {
        // Only current financial year data
        query_1.approvalDate = { $gte: startDate, $lte: endDate };
      } else if (dataType === "priorToFinancialYear") {
        // Data before the current financial year
        query_1.approvalDate = { $lt: startDate };
      }
      // If dataType is "cumulative", don't apply any date filter (fetch all data)
    }

    // console.log("query", query);
    // console.log("query_1", query_1);

    const [
      totalCentersCount,
      totalDistrictsCount,
      totalBlocksCount,
      totalVillagesCount,
      totalBeneficiariesCount,
      totalFamiliesCount,
      totalCostSum,
      totalEmpSum,
    ] = await Promise.all([
      Centers.countDocuments(query),
      Centers.aggregate([
        { $match: query },
        { $unwind: "$villagesCovered" },
        { $group: { _id: "$villagesCovered.district" } },
        { $count: "totalDistricts" },
      ]).then((result) => (result.length > 0 ? result[0].totalDistricts : 0)),
      Centers.aggregate([
        { $match: query },
        { $unwind: "$villagesCovered" },
        { $group: { _id: "$villagesCovered.block" } },
        { $count: "totalBlocks" },
      ]).then((result) => (result.length > 0 ? result[0].totalBlocks : 0)),
      Centers.aggregate([
        { $match: query },
        { $unwind: "$villagesCovered" },
        { $count: "totalVillages" },
      ]).then((result) => (result.length > 0 ? result[0].totalVillages : 0)),
      Utilization.aggregate([
        { $match: query_1 },
        {
          $group: {
            _id: null,
            totalBeneficiaries: { $sum: "$noOfBeneficiaries" },
          },
        },
      ]).then((result) =>
        result.length > 0 ? result[0].totalBeneficiaries : 0
      ),
      Utilization.aggregate([
        { $match: query_1 },
        { $group: { _id: null, totalFamilies: { $sum: "$noOfHouseholds" } } },
      ]).then((result) => (result.length > 0 ? result[0].totalFamilies : 0)),
      Utilization.aggregate([
        { $match: query_1 },
        { $group: { _id: null, totalCost: { $sum: "$totalCost" } } },
      ]).then((result) =>
        result.length > 0 ? formatWithUnits(result[0].totalCost) : "0"
      ),
      Centers.aggregate([
        { $match: query },
        { $group: { _id: null, totalEmpSum: { $sum: "$totalEmp" } } },
      ]).then((result) => (result.length > 0 ? result[0].totalEmpSum : 0)),
    ]);

    // console.log("totalCentersCount", totalCentersCount);

    res.status(200).json({
      totalCenters: totalCentersCount,
      totalDistricts: totalDistrictsCount?.toLocaleString("en-IN"),
      totalBlocks: totalBlocksCount?.toLocaleString("en-IN"),
      totalVillages: totalVillagesCount?.toLocaleString("en-IN"),
      totalBeneficiaries: totalBeneficiariesCount?.toLocaleString("en-IN"),
      totalFamilies: totalFamiliesCount?.toLocaleString("en-IN"),
      totalCost: totalCostSum,
      totalEmpSum: totalEmpSum?.toLocaleString("en-IN"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function formatWithUnits(value) {
  if (value >= 1e7) {
    return (value / 1e7).toFixed(1) + " CR";
  } else if (value >= 1e5) {
    return (value / 1e5).toFixed(1) + " L";
  } else if (value >= 1e3) {
    return (value / 1e3).toFixed(1) + " k";
  } else {
    return value.toString();
  }
}

exports.approval_vs_utilization_report = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = "1";
  var query = {};

  const financialYear = req.body.year;
  // Get the start and end dates for the financial year
  if (req.body.year !== "all") {
    const { startDate, endDate } = getFinancialYearDates(financialYear);
    query.approvalDate = {
      $gte: startDate,
      $lte: endDate,
    };
  }
  if (req.body.center_ID !== "all")
    query.center_id = new ObjectId(req.body.center_ID);

  Utilization.aggregate([
    {
      $match: query,
    },
    {
      $project: {
        _id: 0,
        centerName: 1,
        program: 1,
        project: 1,
        activityName: 1,
        subactivityName: 1,
        center_id: 1,
        program_id: 1,
        project_id: 1,
        activityName_id: 1,
        subactivityName_id: 1,
        utilApprovalNo: "$approvalNo",
        quantity: 1,
        totalCost: 1,
        sourceofFund: 1,
        convergence: 1,
        noOfHouseholds: 1,
        noOfBeneficiaries: 1,
      },
    },
    {
      $lookup: {
        from: "approvaldetails",
        localField: "utilApprovalNo",
        foreignField: "approvalNo",
        as: "abc",
      },
    },
    {
      $unwind: "$abc",
    },
    {
      $project: {
        _id: 0,
        centerName: 1,
        program: 1,
        project: 1,
        activityName: 1,
        subactivityName: 1,
        center_id: 1,
        program_id: 1,
        project_id: 1,
        activityName_id: 1,
        subactivityName_id: 1,
        approvalNo: "$abc.approvalNo",
        approvalUnit: "$abc.unit",
        approvalQuantity: "$abc.quantity",
        totalApprovalAmount: "$abc.totalCost",
        approvalLHWRF: "$abc.sourceofFund.LHWRF",
        approvalCC: "$abc.sourceofFund.CC",
        approvalExtGrant: "$abc.sourceofFund.grant",
        utilizationQuantity: "$quantity",
        utilizedAmount: "$totalCost",
        utilisedLHWRF: "$sourceofFund.LHWRF",
        utilisedCC: "$sourceofFund.CC",
        utilisedExtGrant: "$sourceofFund.grant",
        approvalNoOfHouseholds: "$abc.noOfHouseholds",
        approvalNoOfBeneficiaries: "$abc.noOfBeneficiaries",
        utilizedNoOfHouseholds: "$noOfHouseholds",
        utilizedNoOfBeneficiaries: "$noOfBeneficiaries",
        approvalConvergence: "$abc.convergence",
        utilizedConvergence: "$convergence",
      },
    },
    {
      $group: {
        _id: {
          centerName: "$centerName",
          program: "$program",
          project: "$project",
          activityName: "$activityName",
          subactivityName: "$subactivityName",
          center_id: "$center_id",
          program_id: "$program_id",
          project_id: "$project_id",
          activityName_id: "$activityName_id",
          subactivityName_id: "$subactivityName_id",
          approvalNo: "$approvalNo",
          approvalUnit: "$approvalUnit",
          approvalQuantity: "$approvalQuantity",
          totalApprovalAmount: "$totalApprovalAmount",
          approvalLHWRF: "$approvalLHWRF",
          approvalCC: "$approvalCC",
          approvalConvergence: "$approvalConvergence",
          approvalExtGrant: "$approvalExtGrant",
          approvalNoOfHouseholds: "$approvalNoOfHouseholds",
          approvalNoOfBeneficiaries: "$approvalNoOfBeneficiaries",
        },
        totalUtilisedQuantity: { $sum: "$utilizationQuantity" },
        totalUtilisedAmount: { $sum: "$utilizedAmount" },
        totalUtilisedLHWRF: { $sum: "$utilisedLHWRF" },
        totalUtilisedCC: { $sum: "$utilisedCC" },
        totalUtilisedExtGrant: { $sum: "$utilisedExtGrant" },
        totalConvergence: { $sum: "$utilizedConvergence" },
        totalNoOfHouseholds: { $sum: "$utilizedNoOfHouseholds" },
        totalNoOfBeneficiaries: { $sum: "$utilizedNoOfBeneficiaries" },
      },
    },
    {
      $project: {
        _id: 0,
        centerName: "$_id.centerName",
        program: "$_id.program",
        project: "$_id.project",
        activityName: "$_id.activityName",
        subactivityName: "$_id.subactivityName",
        center_id: "$_id.center_id",
        program_id: "$_id.program_id",
        project_id: "$_id.project_id",
        activityName_id: "$_id.activityName_id",
        subactivityName_id: "$_id.subactivityName_id",
        approvalNo: "$_id.approvalNo",
        approvalUnit: "$_id.approvalUnit",
        approvalQuantity: "$_id.approvalQuantity",
        totalApprovalAmount: "$_id.totalApprovalAmount",
        approvalLHWRF: "$_id.approvalLHWRF",
        approvalCC: "$_id.approvalCC",
        approvalExtGrant: "$_id.approvalExtGrant",
        approvalConvergence: "$_id.approvalConvergence",
        approvalNoOfHouseholds: "$_id.approvalNoOfHouseholds",
        approvalNoOfBeneficiaries: "$_id.approvalNoOfBeneficiaries",
        totalUtilisedQuantity: "$totalUtilisedQuantity",
        // utilizationUnit: "$utilizationUnit",
        totalUtilisedAmount: "$totalUtilisedAmount",
        totalUtilisedLHWRF: "$totalUtilisedLHWRF",
        totalUtilisedCC: "$totalUtilisedCC",
        totalUtilisedExtGrant: "$totalUtilisedExtGrant",
        totalConvergence: "$totalConvergence",
        totalNoOfHouseholds: "$totalNoOfHouseholds",
        totalNoOfBeneficiaries: "$totalNoOfBeneficiaries",
        percentageUtilizedAgainstApproval: {
          $cond: [
            { $eq: ["$_id.totalApprovalAmount", 0] },
            0,
            {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$totalUtilisedAmount",
                        "$_id.totalApprovalAmount",
                      ],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
          ],
        },
        balanceAmount: {
          $subtract: ["$_id.totalApprovalAmount", "$totalUtilisedAmount"],
        },
      },
    },
  ])
    // .skip(parseInt(skipRec))
    // .limit(parseInt(recsPerPage))
    .sort({ center: 1 })
    .limit(2)
    .then((data) => {
      var approvalQuantity = 0;
      var totalApprovalAmount = 0;
      var approvalLHWRF = 0;
      var approvalCC = 0;
      var approvalExtGrant = 0;
      var approvalConvergence = 0;
      var approvalNoOfHouseholds = 0;
      var approvalNoOfBeneficiaries = 0;
      var totalUtilisedQuantity = 0;
      var totalUtilisedAmount = 0;
      var totalUtilisedLHWRF = 0;
      var totalUtilisedCC = 0;
      var totalUtilisedExtGrant = 0;
      var totalConvergence = 0;
      var totalNoOfHouseholds = 0;
      var totalNoOfBeneficiaries = 0;
      var totalPercentageUtilized = 0;
      var balanceAmount = 0;
      var cumulativeData = [];
      for (var index = 0; index < data.length; index++) {
        approvalQuantity += data[index].approvalQuantity
          ? data[index].approvalQuantity
          : 0;
        totalApprovalAmount += data[index].totalApprovalAmount
          ? data[index].totalApprovalAmount
          : 0;
        approvalLHWRF += data[index].approvalLHWRF
          ? data[index].approvalLHWRF
          : 0;
        approvalCC += data[index].approvalCC ? data[index].approvalCC : 0;
        approvalExtGrant += data[index].approvalExtGrant
          ? data[index].approvalExtGrant
          : 0;
        approvalConvergence += data[index].approvalConvergence
          ? data[index].approvalConvergence
          : 0;
        approvalNoOfHouseholds += data[index].approvalNoOfHouseholds
          ? data[index].approvalNoOfHouseholds
          : 0;
        approvalNoOfBeneficiaries += data[index].approvalNoOfBeneficiaries
          ? data[index].approvalNoOfBeneficiaries
          : 0;
        totalUtilisedQuantity += data[index].totalUtilisedQuantity
          ? data[index].totalUtilisedQuantity
          : 0;
        totalUtilisedAmount += data[index].totalUtilisedAmount
          ? data[index].totalUtilisedAmount
          : 0;
        totalUtilisedLHWRF += data[index].totalUtilisedLHWRF
          ? data[index].totalUtilisedLHWRF
          : 0;
        totalUtilisedCC += data[index].totalUtilisedCC
          ? data[index].totalUtilisedCC
          : 0;
        totalUtilisedExtGrant += data[index].totalUtilisedExtGrant
          ? data[index].totalUtilisedExtGrant
          : 0;
        totalConvergence += data[index].totalConvergence
          ? data[index].totalConvergence
          : 0;
        totalNoOfHouseholds += data[index].totalNoOfHouseholds
          ? data[index].totalNoOfHouseholds
          : 0;
        totalNoOfBeneficiaries += data[index].totalNoOfBeneficiaries
          ? data[index].totalNoOfBeneficiaries
          : 0;
        if (totalApprovalAmount > 0) {
          totalPercentageUtilized =
            (totalUtilisedAmount / totalApprovalAmount) * 100;
        }
        balanceAmount += data[index].balanceAmount
          ? data[index].balanceAmount
          : 0;
      }
      if (index >= data.length && data.length > 0) {
        const totalPercentage = totalApprovalAmount
          ? (totalUtilisedAmount / totalApprovalAmount) * 100
          : 0;

        const roundedTotalPercentage = Math.round(totalPercentage * 100) / 100;
        data.push({
          centerName: "Total",
          program: "-",
          project: "-",
          activityName: "-",
          subactivityName: "-",
          program_id: "-",
          project_id: "-",
          activityName_id: "-",
          subactivityName_id: "-",
          approvalNo: "-",
          approvalUnit: "-",
          approvalQuantity: approvalQuantity ? approvalQuantity : 0,
          totalApprovalAmount: totalApprovalAmount ? totalApprovalAmount : 0,
          approvalLHWRF: approvalLHWRF ? approvalLHWRF : 0,
          approvalCC: approvalCC ? approvalCC : 0,
          approvalExtGrant: approvalExtGrant ? approvalExtGrant : 0,
          approvalConvergence: approvalConvergence ? approvalConvergence : 0,
          approvalNoOfHouseholds: approvalNoOfHouseholds
            ? approvalNoOfHouseholds
            : 0,
          approvalNoOfBeneficiaries: approvalNoOfBeneficiaries
            ? approvalNoOfBeneficiaries
            : 0,
          // utilizationUnit: "-",
          totalUtilisedQuantity: totalUtilisedQuantity
            ? totalUtilisedQuantity
            : 0,
          totalUtilisedAmount: totalUtilisedAmount ? totalUtilisedAmount : 0,
          totalUtilisedLHWRF: totalUtilisedLHWRF ? totalUtilisedLHWRF : 0,
          totalUtilisedCC: totalUtilisedCC ? totalUtilisedCC : 0,
          totalUtilisedExtGrant: totalUtilisedExtGrant
            ? totalUtilisedExtGrant
            : 0,
          totalConvergence: totalConvergence ? totalConvergence : 0,
          totalNoOfHouseholds: totalNoOfHouseholds ? totalNoOfHouseholds : 0,
          totalNoOfBeneficiaries: totalNoOfBeneficiaries
            ? totalNoOfBeneficiaries
            : 0,
          percentageUtilizedAgainstApproval: roundedTotalPercentage
            ? roundedTotalPercentage
            : 0,
          balanceAmount: balanceAmount ? balanceAmount : 0,
        });
      }
      // console.log("data",data)
      res.status(200).json({
        tableData: data,
        success: true,
      });
    })
    .catch((error) => {
      console.log("Error in ApprovalList1  => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    });
};

const getCurrentFinancialYear = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const isBeforeApril = today < new Date(currentYear, 3, 1); // Before April 1st
  const startYear = isBeforeApril ? currentYear - 1 : currentYear;
  const endYear = startYear + 1;
  return `${startYear}-${endYear.toString().slice(-2)}`;
};
exports.plan_vs_utilization_report = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = {};
  const currentFinancialYear = getCurrentFinancialYear();
  const financialYear =
    req.body.year !== "" ? req.body.year : currentFinancialYear;

  if (req.body.year && req.body.year !== "all") {
    query.year = req.body.year;
    const { startDate, endDate } = getFinancialYearDates(financialYear);

  }

  if (req.body.center_ID && req.body.center_ID !== "all")
    query.center_id = new ObjectId(req.body.center_ID);

  let paginatedDataStages = [];

  if (!req.body.removePagination) {
    paginatedDataStages.push(
      // { $skip: parseInt(skipRec) },
      { $limit: parseInt(2) }
    );
  }
  AnnualPlan.aggregate([
    {
      $match: query,
    },
    {
      $project: {
        _id: 0,
        centerName: 1,
        program: 1,
        project: 1,
        activityName: 1,
        subactivityName: 1,
        center_id: 1,
        program_id: 1,
        project_id: 1,
        activityName_id: 1,
        subactivityName_id: 1,
        unit: 1,
        quantity: 1,
        totalCost: 1,
        sourceofFund: 1,
        convergence: 1,
        noOfHouseholds: 1,
        noOfBeneficiaries: 1,
      },
    },
    {
      $lookup: {
        from: "utilizationdetails", // Collection to join
        let: {
          subactivityName_id: "$subactivityName_id",
          center_id: "$center_id",
        }, // Local variables
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$subactivityName_id", "$$subactivityName_id"] }, // Match on subactivityName_id
                  { $eq: ["$center_id", "$$center_id"] }, // Match on center_id
                  // {
                  //   $gte: ["$approvalDate", startDate], // Greater than or equal to fromDate
                  // },
                  // {
                  //   $lte: ["$approvalDate", endDate], // Less than or equal to toDate
                  // },
                ],
              },
            },
          },
        ],
        as: "utilizationData",
      },
    },
    {
      $unwind: "$utilizationData",
    },
    {
      $project: {
        _id: 0,
        centerName: 1,
        program: 1,
        project: 1,
        activityName: 1,
        subactivityName: 1,
        program_id: 1,
        project_id: 1,
        activityName_id: 1,
        subactivityName_id: 1,
        plannedUnit: "$unit",
        plannedQuantity: "$quantity",
        plannedAmount: "$totalCost",
        plannedLHWRF: "$sourceofFund.LHWRF",
        plannedCC: "$sourceofFund.CC",
        plannedConvergence: "$convergence",
        plannedExtGrant: "$sourceofFund.grant",
        plannedNoOfHouseholds: "$noOfHouseholds",
        plannedNoOfBeneficiaries: "$noOfBeneficiaries",
        utilizationQuantity: "$utilizationData.quantity",
        utilizationAmount: "$utilizationData.totalCost",
        utilizationLHWRF: "$utilizationData.sourceofFund.LHWRF",
        utilizationCC: "$utilizationData.sourceofFund.CC",
        utilizationExtGrant: "$utilizationData.sourceofFund.grant",
        utilizationConvergence: "utilizationData.convergence",
        utilizationNoOfHouseholds: "$utilizationData.noOfHouseholds",
        utilizationNoOfBeneficiaries: "$utilizationData.noOfBeneficiaries",
      },
    },
    {
      $group: {
        _id: {
          centerName: "$centerName",
          program: "$program",
          project: "$project",
          activityName: "$activityName",
          subactivityName: "$subactivityName",
          program_id: "$program_id",
          project_id: "$project_id",
          activityName_id: "$activityName_id",
          subactivityName_id: "$subactivityName_id",
          plannedUnit: "$plannedUnit",
          plannedQuantity: "$plannedQuantity",
          plannedAmount: "$plannedAmount",
          plannedLHWRF: "$plannedLHWRF",
          plannedCC: "$plannedCC",
          plannedExtGrant: "$plannedExtGrant",
          plannedConvergence: "$plannedConvergence",
          plannedNoOfHouseholds: "$plannedNoOfHouseholds",
          plannedNoOfBeneficiaries: "$plannedNoOfBeneficiaries",
        },
        totalUtilisedQuantity: { $sum: "$utilizationQuantity" },
        totalUtilisedAmount: { $sum: "$utilizationAmount" },
        totalUtilisedLHWRF: { $sum: "$utilizationLHWRF" },
        totalUtilisedCC: { $sum: "$utilizationCC" },
        totalUtilisedExtGrant: { $sum: "$utilizationExtGrant" },
        totalUtilisedConvergence: { $sum: "$utilizationConvergence" },
        totalNoOfHouseholds: { $sum: "$utilizationNoOfHouseholds" },
        totalNoOfBeneficiaries: { $sum: "$utilizationNoOfBeneficiaries" },
      },
    },
    {
      $project: {
        _id: 0,
        centerName: "$_id.centerName",
        program: "$_id.program",
        project: "$_id.project",
        activityName: "$_id.activityName",
        subactivityName: "$_id.subactivityName",
        program_id: "$_id.program_id",
        project_id: "$_id.project_id",
        activityName_id: "$_id.activityName_id",
        subactivityName_id: "$_id.subactivityName_id",
        plannedUnit: "$_id.plannedUnit",
        plannedQuantity: "$_id.plannedQuantity",
        plannedAmount: "$_id.plannedAmount",
        plannedLHWRF: "$_id.plannedLHWRF",
        plannedCC: "$_id.plannedCC",
        plannedExtGrant: "$_id.plannedExtGrant",
        plannedConvergence: "$_id.plannedConvergence",
        plannedNoOfHouseholds: "$_id.plannedNoOfHouseholds",
        plannedNoOfBeneficiaries: "$_id.plannedNoOfBeneficiaries",

        totalUtilisedQuantity: "$totalUtilisedQuantity",
        totalUtilisedAmount: "$totalUtilisedAmount",
        totalUtilisedLHWRF: "$totalUtilisedLHWRF",
        totalUtilisedCC: "$totalUtilisedCC",
        totalUtilisedExtGrant: "$totalUtilisedExtGrant",
        totalUtilisedConvergence: "$totalUtilisedConvergence",
        totalNoOfHouseholds: "$totalNoOfHouseholds",
        totalNoOfBeneficiaries: "$totalNoOfBeneficiaries",
        percentageUtilizedAgainstPlan: {
          $cond: [
            { $eq: ["$_id.plannedAmount", 0] },
            0,
            {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: ["$totalUtilisedAmount", "$_id.plannedAmount"],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
          ],
        },
        balanceAmount: {
          $subtract: ["$_id.plannedAmount", "$totalUtilisedAmount"],
        },
      },
    },
    {
      $facet: {
        totalRecords: [{ $count: "count" }],
        paginatedData: paginatedDataStages, // Dynamic paginated data stages
      },
    },
    {
      $project: {
        totalRecords: {
          $ifNull: [{ $arrayElemAt: ["$totalRecords.count", 0] }, 0], // Prevent undefined error
        },
        paginatedData: 1,
      },
    },
  ])

    .then((response) => {

      var data = response[0].paginatedData;
      var plannedQuantity = 0;
      var plannedAmount = 0;
      var plannedLHWRF = 0;
      var plannedCC = 0;
      var plannedExtGrant = 0;
      var plannedConvergence = 0;
      var plannedNoOfHouseholds = 0;
      var plannedNoOfBeneficiaries = 0;
      var totalUtilisedQuantity = 0;
      var totalUtilisedAmount = 0;
      var totalUtilisedLHWRF = 0;
      var totalUtilisedCC = 0;
      var totalUtilisedExtGrant = 0;
      var totalUtilisedConvergence = 0;
      var totalNoOfHouseholds = 0;
      var totalNoOfBeneficiaries = 0;
      var totalPercentageUtilized = 0;
      var balanceAmount = 0;
      var cumulativeData = [];
      for (var index = 0; index < data.length; index++) {
        plannedQuantity += data[index].plannedQuantity
          ? data[index].plannedQuantity
          : 0;
        plannedAmount += data[index].plannedAmount
          ? data[index].plannedAmount
          : 0;
        plannedLHWRF += data[index].plannedLHWRF ? data[index].plannedLHWRF : 0;
        plannedCC += data[index].plannedCC ? data[index].plannedCC : 0;
        plannedExtGrant += data[index].plannedExtGrant
          ? data[index].plannedExtGrant
          : 0;
        plannedConvergence += data[index].plannedConvergence
          ? data[index].plannedConvergence
          : 0;
        plannedNoOfHouseholds += data[index].plannedNoOfHouseholds
          ? data[index].plannedNoOfHouseholds
          : 0;
        plannedNoOfBeneficiaries += data[index].plannedNoOfBeneficiaries
          ? data[index].plannedNoOfBeneficiaries
          : 0;
        totalUtilisedQuantity += data[index].totalUtilisedQuantity
          ? data[index].totalUtilisedQuantity
          : 0;
        totalUtilisedAmount += data[index].totalUtilisedAmount
          ? data[index].totalUtilisedAmount
          : 0;
        totalUtilisedLHWRF += data[index].totalUtilisedLHWRF
          ? data[index].totalUtilisedLHWRF
          : 0;
        totalUtilisedCC += data[index].totalUtilisedCC
          ? data[index].totalUtilisedCC
          : 0;
        totalUtilisedExtGrant += data[index].totalUtilisedExtGrant
          ? data[index].totalUtilisedExtGrant
          : 0;
        totalUtilisedConvergence += data[index].totalUtilisedConvergence
          ? data[index].totalUtilisedConvergence
          : 0;
        totalNoOfHouseholds += data[index].totalNoOfHouseholds
          ? data[index].totalNoOfHouseholds
          : 0;
        totalNoOfBeneficiaries += data[index].totalNoOfBeneficiaries
          ? data[index].totalNoOfBeneficiaries
          : 0;
        if (plannedAmount > 0) {
          totalPercentageUtilized = (totalUtilisedAmount / plannedAmount) * 100;
        }
        balanceAmount += data[index].balanceAmount
          ? data[index].balanceAmount
          : 0;
      }
      if (index >= data.length && data.length > 0) {
        const totalPercentage = plannedAmount
          ? (totalUtilisedAmount / plannedAmount) * 100
          : 0;

        const roundedTotalPercentage = Math.round(totalPercentage * 100) / 100;

        data.push({
          centerName: "Total",
          program: "-",
          project: "-",
          activityName: "-",
          subactivityName: "-",
          program_id: "-",
          project_id: "-",
          activityName_id: "-",
          subactivityName_id: "-",
          plannedUnit: "-",
          plannedQuantity: plannedQuantity,
          plannedAmount: plannedAmount,
          plannedLHWRF: plannedLHWRF,
          plannedCC: plannedCC,
          plannedExtGrant: plannedExtGrant,
          plannedConvergence: plannedConvergence,
          plannedNoOfHouseholds: plannedNoOfHouseholds,
          plannedNoOfBeneficiaries: plannedNoOfBeneficiaries,
          totalUtilisedQuantity: totalUtilisedQuantity
            ? totalUtilisedQuantity
            : 0,
          totalUtilisedAmount: totalUtilisedAmount ? totalUtilisedAmount : 0,
          totalUtilisedLHWRF: totalUtilisedLHWRF ? totalUtilisedLHWRF : 0,
          totalUtilisedCC: totalUtilisedCC ? totalUtilisedCC : 0,
          totalUtilisedExtGrant: totalUtilisedExtGrant
            ? totalUtilisedExtGrant
            : 0,
          totalUtilisedConvergence: totalUtilisedConvergence
            ? totalUtilisedConvergence
            : 0,
          totalNoOfHouseholds: totalNoOfHouseholds ? totalNoOfHouseholds : 0,
          totalNoOfBeneficiaries: totalNoOfBeneficiaries
            ? totalNoOfBeneficiaries
            : 0,
          percentageUtilizedAgainstPlan: roundedTotalPercentage
            ? roundedTotalPercentage
            : 0,
          balanceAmount: balanceAmount ? balanceAmount : 0,
        });
      }
      // console.log("data",data)
      res.status(200).json({
        totalRecs: response[0].totalRecords[0],
        tableData: data,
        success: true,
      });
    })
    .catch((error) => {
      console.log("Error in plan_vs_utilization_report  => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    });
};

exports.centerwise_approval_vs_utilization_report = async (req, res) => {
  try {
    const {
      center_ID = "all",
      program_id = "all",
      project_id = "all",
      activityName_id = "all",
      subactivityName_id = "all",
      fromDate,
      toDate,
    } = req.body;

    const matchApproval = {};
    const matchUtilization = {};

    const isValidObjectId = (id) =>
      mongoose.Types.ObjectId.isValid(id) &&
      String(new mongoose.Types.ObjectId(id)) === id;

    if (center_ID !== "all" && isValidObjectId(center_ID)) {
      matchApproval.center_id = new mongoose.Types.ObjectId(center_ID);
      matchUtilization.center_id = new mongoose.Types.ObjectId(center_ID);
    }
    if (program_id !== "all" && isValidObjectId(program_id)) {
      matchApproval.program_id = new mongoose.Types.ObjectId(program_id);
      matchUtilization.program_id = new mongoose.Types.ObjectId(program_id);
    }
    if (project_id !== "all" && isValidObjectId(project_id)) {
      matchApproval.project_id = new mongoose.Types.ObjectId(project_id);
      matchUtilization.project_id = new mongoose.Types.ObjectId(project_id);
    }
    if (activityName_id !== "all" && isValidObjectId(activityName_id)) {
      matchApproval.activityName_id = new mongoose.Types.ObjectId(activityName_id);
      matchUtilization.activityName_id = new mongoose.Types.ObjectId(activityName_id);
    }
    if (subactivityName_id !== "all" && isValidObjectId(subactivityName_id)) {
      matchApproval.subactivityName_id = new mongoose.Types.ObjectId(subactivityName_id);
      matchUtilization.subactivityName_id = new mongoose.Types.ObjectId(subactivityName_id);
    }

    if (fromDate !== "all" && toDate !== "all") {
      matchApproval.approvalDate = { $gte: fromDate, $lte: toDate };
      matchUtilization.voucherDate = { $gte: fromDate, $lte: toDate };
    }

    const approvals = await Approval.aggregate([
      { $match: matchApproval },
      {
        $group: {
          _id: "$center_id",
          centerName: { $first: "$centerName" },
          totalApprovalAmount: { $sum: "$totalCost" },
        },
      },
    ]);

    const utilizations = await Utilization.aggregate([
      { $match: matchUtilization },
      {
        $group: {
          _id: "$center_id",
          centerName: { $first: "$centerName" },
          totalUtilisedAmount: { $sum: "$totalCost" },
        },
      },
    ]);

    // Map both results by center_id
    const approvalMap = {};
    approvals.forEach((doc) => {
      approvalMap[String(doc._id)] = doc;
    });

    const utilizationMap = {};
    utilizations.forEach((doc) => {
      utilizationMap[String(doc._id)] = doc;
    });

    // Get all center_ids (even if in only one of the datasets)
    const allCenterIds = new Set([
      ...Object.keys(approvalMap),
      ...Object.keys(utilizationMap),
    ]);

    const result = [];
    for (const centerId of allCenterIds) {
      const approval = approvalMap[centerId] || {};
      const utilization = utilizationMap[centerId] || {};

      const centerName = approval.centerName || utilization.centerName || "-";
      const totalApprovalAmount = approval.totalApprovalAmount || 0;
      const totalUtilisedAmount = utilization.totalUtilisedAmount || 0;

      const utilizedPercentage =
        totalApprovalAmount > 0
          ? ((totalUtilisedAmount / totalApprovalAmount) * 100).toFixed(2)
          : "0";

      const approvedPercentage =
        (totalApprovalAmount + totalUtilisedAmount) > 0
          ? ((totalApprovalAmount / (totalApprovalAmount + totalUtilisedAmount)) * 100).toFixed(2)
          : "0";

      result.push({
        centerId,
        centerName,
        totalApprovalAmount,
        totalUtilisedAmount,
        utilizedPercentage: parseFloat(utilizedPercentage),
        approvedPercentage: parseFloat(approvedPercentage),
      });
    }
    const sorted = result.sort((a, b) => a.centerName.localeCompare(b.centerName));


    res.status(200).json({ tableData: sorted, success: true });
  } catch (err) {
    console.log("centerwise_report_error =>", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

function getFinancialYearDates(financialYear) {
  const [startYear, endYearSuffix] = financialYear.split("-").map(Number);
  const startDate = new Date(`${startYear}-04-01`);
  const endDate = new Date(`${startYear + 1}-03-31`);
  const formatToYYYYDDMM = (date) => {
    const year = date.getFullYear();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatToYYYYDDMM(startDate),
    endDate: formatToYYYYDDMM(endDate),
  };
}

function getQuarterDates(year) {
  const [startYear, endYear] = year.split('-').map(Number);
  return {
    Q1: {
      startDate: new Date(startYear, 3, 1).toISOString().split('T')[0],
      endDate: new Date(startYear, 5, 30).toISOString().split('T')[0]
    }, // April 1 - June 30
    Q2: {
      startDate: new Date(startYear, 6, 1).toISOString().split('T')[0],
      endDate: new Date(startYear, 8, 30).toISOString().split('T')[0]
    }, // July 1 - September 30
    Q3: {
      startDate: new Date(startYear, 9, 1).toISOString().split('T')[0],
      endDate: new Date(startYear, 11, 31).toISOString().split('T')[0]
    }, // October 1 - December 31
    Q4: {
      startDate: new Date(startYear + 1, 0, 1).toISOString().split('T')[0],
      endDate: new Date(startYear + 1, 2, 31).toISOString().split('T')[0]
    }, // January 1 - March 31
  };
}
    
exports.centerwise_plan_vs_utilization_report = async (req, res) => {
  try {
    const {
      center_ID = "all",
      fromDate,
      toDate,
      year,
      program_id = "all",
      project_id = "all",
      activityName_id = "all",
      subactivityName_id = "all",
    } = req.body;

    // Get financial year quarters date ranges
    const yearQuarters = getQuarterDates(year);
    const quarters = ["Q1", "Q2", "Q3", "Q4"];

    const filters = {
      ...(center_ID !== "all" && { center_id: new ObjectId(center_ID) }),
      ...(program_id !== "all" && { program_id: new ObjectId(program_id) }),
      ...(project_id !== "all" && { project_id: new ObjectId(project_id) }),
      ...(activityName_id !== "all" && { activityName_id: new ObjectId(activityName_id) }),
      ...(subactivityName_id !== "all" && { subactivityName_id: new ObjectId(subactivityName_id) }),
      ...(year && { year }),
    };

    const plans = await AnnualPlan.find(filters).lean();

    const utilizationFilters = {
      ...(center_ID !== "all" && { center_id: new ObjectId(center_ID) }),
      ...(program_id !== "all" && { program_id: new ObjectId(program_id) }),
      ...(project_id !== "all" && { project_id: new ObjectId(project_id) }),
      ...(activityName_id !== "all" && { activityName_id: new ObjectId(activityName_id) }),
      ...(subactivityName_id !== "all" && { subactivityName_id: new ObjectId(subactivityName_id) }),
      voucherDate: {
        $gte: fromDate,
        $lte: toDate,
      },
    };

    const utilizations = await Utilization.find(utilizationFilters).lean();

    const centerMap = {}; // Accumulate totals per center

    for (const plan of plans) {
      const center = plan.centerName || "Unknown";
      if (!centerMap[center]) {
        centerMap[center] = {
          centerName: center,
          plannedAmount: 0,
          totalUtilisedAmount: 0,
        };
      }
      centerMap[center].plannedAmount += plan.totalCost || 0;
    }

    for (const u of utilizations) {
      const center = u.centerName || "Unknown";
      if (!centerMap[center]) {
        centerMap[center] = {
          centerName: center,
          plannedAmount: 0,
          totalUtilisedAmount: 0,
        };
      }
      centerMap[center].totalUtilisedAmount += u.totalCost || 0;
    }

    const resultArray = Object.values(centerMap).map((entry) => {
      const utilizedPercentage = entry.plannedAmount
        ? parseFloat(((entry.totalUtilisedAmount / entry.plannedAmount) * 100).toFixed(2))
        : 0;
      return {
        ...entry,
        plannedPercentage: 100,
        utilizedPercentage,
      };
    });

    const sorted = resultArray.sort((a, b) => a.centerName.localeCompare(b.centerName));

    return res.status(200).json({
      success: true,
      tableData: sorted,
      totalRecs: resultArray.length,
    });
  } catch (err) {
    console.error("Center-wise Graph Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error while generating graph data",
      error: err.message,
    });
  }
};



exports.get_mobile_app_dashboard_data = async (req, res, next) => {
  try {
    let query = {};
    if (req.params.centerName !== "all") {
      // query._id = req.params.center_id;
      query.centerName = req.params.centerName; // Convert string to ObjectId
    }

    // console.log("plantation center_id", req.params.centerName);

    const [
      totalPlantationVillagesCount,
      totalPlantationFarmersCount,
      totalPlantsCount,
      totalWRDVillagesCount,
      totalWRDFarmersCount,
      totalWRDCount,
    ] = await Promise.all([
      Plantation.aggregate([
        { $match: query },
        { $unwind: "$locationDetails" },
        { $group: { _id: "$locationDetails.village" } },
        { $count: "total" },
      ]).then((result) => (result.length > 0 ? result[0].total : 0)),

      // Count unique farmers in Plantation collection
      Plantation.aggregate([
        { $match: query },
        { $unwind: "$farmerDetails" },
        { $group: { _id: "$farmerDetails.farmerName" } },
        { $count: "total" },
      ]).then((result) => (result.length > 0 ? result[0].total : 0)),

      // Sum numberOfSaplings in Plantation collection

      Plantation.aggregate([
        { $match: query }, // Match the query (e.g., center_id)
        { $unwind: "$plantationDetails" }, // Unwind plantationDetails array
        { $unwind: "$plantationDetails.speciesDetails" }, // Unwind speciesDetails array
        {
          $group: {
            _id: null,
            totalSaplings: {
              $sum: "$plantationDetails.speciesDetails.numberOfSaplings",
            }, // Sum the numberOfSaplings
          },
        },
      ])
        .then((result) => {
          // console.log("Total Saplings Result:", result);
          return result.length > 0 ? result[0].totalSaplings : 0;
        })
        .catch((err) => {
          console.error("Error in summing saplings:", err);
          return 0;
        }),

      // Count unique villages in WRD collection
      WRD.aggregate([
        { $match: query },
        { $unwind: "$locationDetails" },
        { $group: { _id: "$locationDetails.village" } },
        { $count: "total" },
      ]).then((result) => (result.length > 0 ? result[0].total : 0)),

      // Count unique farmers in WRD collection
      WRD.aggregate([
        { $match: query },
        { $unwind: "$farmerDetails" },
        { $group: { _id: "$farmerDetails.farmerName" } },
        { $count: "total" },
      ]).then((result) => (result.length > 0 ? result[0].total : 0)),

      // Count total objects in WRDDetails array in WRD collection
      WRD.aggregate([
        { $match: query },
        { $unwind: "$wrdDetails" },
        { $count: "total" },
      ]).then((result) => (result.length > 0 ? result[0].total : 0)),
    ]);

    // console.log("Total Plantation Villages:", totalPlantationVillagesCount);
    // console.log("Total Plantation Farmers:", totalPlantationFarmersCount);
    // console.log("Total Saplings:", totalPlantsCount);
    // console.log("Total WRD Villages:", totalWRDVillagesCount);
    // console.log("Total WRD Farmers:", totalWRDFarmersCount);
    // console.log("Total WRD Objects:", totalWRDCount);

    res.status(200).json({
      totalPlantationVillages: totalPlantationVillagesCount,
      totalPlantationFarmers: totalPlantationFarmersCount,
      totalPlants: totalPlantsCount,
      totalWRDVillages: totalWRDVillagesCount,
      totalWRDFarmers: totalWRDFarmersCount,
      totalWRDObjects: totalWRDCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};