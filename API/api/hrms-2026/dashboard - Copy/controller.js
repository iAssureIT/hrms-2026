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
    var query = {};
    console.log("req.params.center_id", req.params.center_id);
    if (req.params.center_id !== "all") {
      // query._id = req.params.center_id;
      query._id = new ObjectId(req.params.center_id); // Convert string to ObjectId
    }

    var query_1 = {};

    var query_2 = {};

    const financialYear = req.params.year;
    // Get the start and end dates for the financial year
    if (req.params.year !== "all") {
      const { startDate, endDate } = getFinancialYearDates(financialYear);
      console.log("startDate, endDate", startDate, endDate);
      query_1.approvalDate = {
        $gte: startDate,
        $lte: endDate,
      };

      query_2.approvalDate = {
        $lt: startDate,
      };
    }
    if (req.params.center_id !== "all") {
      query_1.center_id = new ObjectId(req.params.center_id); // Convert string to ObjectId
      query_2.center_id = new ObjectId(req.params.center_id); // Convert string to ObjectId
    }

    console.log("query", query);
    console.log("query_1", query_1);
    console.log("query_2", query_2);
    const [
      totalCentersCount,
      totalDistrictsCount,
      totalBlocksCount,
      totalVillagesCount,
      totalBeneficiariesCount,
      totalHistoricBeneficiaries,
      totalFamiliesCount,
      totalHistoricFamilies,
      totalCostSum,
      totalHistoricCost,
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
        { $group: { _id: "$villagesCovered.village" } },
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
        { $match: query_2 },
        {
          $group: {
            _id: null,
            totalHistoricBeneficiaries: { $sum: "$noOfBeneficiaries" },
          },
        },
      ]).then((result) =>
        result.length > 0 ? result[0].totalHistoricBeneficiaries : 0
      ),

      Utilization.aggregate([
        { $match: query_1 },
        { $group: { _id: null, totalFamilies: { $sum: "$noOfHouseholds" } } },
      ]).then((result) => (result.length > 0 ? result[0].totalFamilies : 0)),

      Utilization.aggregate([
        { $match: query_2 },
        {
          $group: {
            _id: null,
            totalHistoricFamilies: { $sum: "$noOfHouseholds" },
          },
        },
      ]).then((result) =>
        result.length > 0 ? result[0].totalHistoricFamilies : 0
      ),

      Utilization.aggregate([
        { $match: query_1 },
        { $group: { _id: null, totalCost: { $sum: "$totalCost" } } },
      ]).then((result) =>
        result.length > 0 ? formatWithUnits(result[0].totalCost) : "0"
      ),

      Utilization.aggregate([
        { $match: query_2 },
        { $group: { _id: null, totalHistoricCost: { $sum: "$totalCost" } } },
      ]).then((result) =>
        result.length > 0 ? formatWithUnits(result[0].totalHistoricCost) : "0"
      ),

      Centers.aggregate([
        { $match: query },
        { $group: { _id: null, totalEmpSum: { $sum: "$totalEmp" } } },
      ]).then((result) => (result.length > 0 ? result[0].totalEmpSum : 0)),
    ]);
    console.log("totalCentersCount", totalCentersCount);
    console.log("totalHistoricBeneficiaries", totalHistoricBeneficiaries);

    res.status(200).json({
      totalCenters: totalCentersCount,
      totalDistricts: totalDistrictsCount?.toLocaleString("en-IN"),
      totalBlocks: totalBlocksCount?.toLocaleString("en-IN"),
      totalVillages: totalVillagesCount?.toLocaleString("en-IN"),
      totalBeneficiaries: totalBeneficiariesCount?.toLocaleString("en-IN"),
      totalHistoricBeneficiaries:
        totalHistoricBeneficiaries?.toLocaleString("en-IN"),
      totalFamilies: totalFamiliesCount?.toLocaleString("en-IN"),
      totalHistoricFamilies: totalHistoricFamilies?.toLocaleString("en-IN"),
      totalCost: totalCostSum,
      totalHistoricCost: totalHistoricCost,
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
    console.log("startDate, endDate", startDate, endDate);
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
exports.plan_vs_utilization_report = (req, res, next) => {
  let recsPerPage = req.body.recsPerPage;
  let pageNum = req.body.pageNumber;
  let skipRec = recsPerPage * (pageNum - 1);
  var query = "1";
  var query = {};

  if (req.body.year !== "all") query.year = req.body.year;

  if (req.body.center_ID !== "all")
    query.center_id = new ObjectId(req.body.center_ID);

  console.log("query", query);

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
        from: "utilizationdetails",
        localField: "subactivityName_id",
        foreignField: "subactivityName_id",
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
  ])
    // .skip(parseInt(skipRec))
    // .limit(parseInt(recsPerPage))
    .sort({ center: 1 })
    .limit(2)
    .then((data) => {
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
      console.log("data planvsUtil ", data.length);
      res.status(200).json({
        tableData: data,
        totalRecs: data.length,
        success: true,
      });
    })
    .catch((error) => {
      console.log("Error in centerwise_plan_vs_utilization_report  => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    });
};

exports.centerwise_approval_vs_utilization_report = async (req, res, next) => {
  try {
    if (req.body.center_ID !== "all") {
      const approvalCount = await Approval.findOne({
        center_id:
          req.body.center_ID !== "all"
            ? new ObjectId(req.body.center_ID)
            : null,
      }).countDocuments({});
      const utilizationCount = await Utilization.findOne({
        center_id:
          req.body.center_ID !== "all"
            ? new ObjectId(req.body.center_ID)
            : null,
      }).countDocuments({});
      console.log("approvalCount", approvalCount);
      console.log("utilizationCount", utilizationCount);

      if (approvalCount === 0 || utilizationCount === 0) {
        return res.status(200).json({
          message:
            "No data available in either Approval or Utilization collection",
          success: false,
        });
      }
    }

    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);
    var query = "1";
    var query = {};
    const financialYear = req.body.year;
    // Get the start and end dates for the financial year
    if (req.body.year !== "all") {
      const { startDate, endDate } = getFinancialYearDates(financialYear);
      console.log("startDate, endDate", startDate, endDate);
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
          utilApprovalNo: "$approvalNo",
          totalCost: 1,
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
          totalApprovalAmount: "$abc.totalCost",
          utilizedAmount: "$totalCost",
        },
      },
      {
        $group: {
          _id: {
            centerName: "$centerName",
          },
          totalApprovalAmount: { $sum: "$totalApprovalAmount" },
          totalUtilisedAmount: { $sum: "$utilizedAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          centerName: "$_id.centerName",
          totalApprovalAmount: "$totalApprovalAmount",
          totalUtilisedAmount: "$totalUtilisedAmount",
        },
      },
    ])
      .sort({ center: 1 })
      .limit(2)
      .then((data) => {
        // console.log("data",data)
        res.status(200).json({
          tableData: data,
          success: true,
        });
      });
  } catch (error) {
    console.log("Error in ApprovalList2  => ", error);
    res.status(500).json({ errorMsg: error.message, success: false });
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
    return `${year}-${day}-${month}`;
  };

  return {
    startDate: formatToYYYYDDMM(startDate),
    endDate: formatToYYYYDDMM(endDate),
  };
}

exports.centerwise_plan_vs_utilization_report = async (req, res, next) => {
  try {
    if (req.body.center_ID !== "all") {
      const annualCount = await AnnualPlan.findOne({
        center_id:
          req.body.center_ID !== "all"
            ? new ObjectId(req.body.center_ID)
            : null,
      }).countDocuments({});
      const utilizationCount = await Utilization.findOne({
        center_id:
          req.body.center_ID !== "all"
            ? new ObjectId(req.body.center_ID)
            : null,
      }).countDocuments({});
      console.log("annualCount", annualCount);
      console.log("utilizationCount", utilizationCount);

      if (annualCount === 0 || utilizationCount === 0) {
        return res.status(200).json({
          message:
            "No data available in either Annual or Utilization collection",
          success: false,
        });
      }
    }

    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);
    var query = {};
    if (req.body.year !== "all") query.year = req.body.year;

    if (req.body.center_ID !== "all")
      query.center_id = new ObjectId(req.body.center_ID);

    console.log("query", query);

    AnnualPlan.aggregate([
      {
        $match: query,
      },
      {
        $project: {
          _id: 0,
          centerName: 1,
          subactivityName: 1,
          subactivityName_id: 1,
          totalCost: 1,
        },
      },
      {
        $lookup: {
          from: "utilizationdetails",
          localField: "subactivityName_id",
          foreignField: "subactivityName_id",
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
          plannedAmount: "$totalCost",
          utilizationAmount: "$utilizationData.totalCost",
        },
      },
      {
        $group: {
          _id: {
            centerName: "$centerName",
          },
          plannedAmount: { $sum: "$plannedAmount" },
          totalUtilisedAmount: { $sum: "$utilizationAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          centerName: "$_id.centerName",
          plannedAmount: "$plannedAmount",
          totalUtilisedAmount: "$totalUtilisedAmount",
        },
      },
    ])
      // .skip(parseInt(skipRec))
      // .limit(parseInt(recsPerPage))
      .sort({ center: 1 })
      .limit(2)
      .then((data) => {
        console.log("data centerwise_plan_vs_utilization_report ", data);
        res.status(200).json({
          tableData: data,
          totalRecs: data.length,
          success: true,
        });
      });
  } catch (error) {
    console.log("Error in centerwise_plan_vs_utilization_report  => ", error);
    res.status(500).json({ errorMsg: error.message, success: false });
  }
};

exports.get_mobile_app_dashboard_data = async (req, res, next) => {
  try {
    let query = {};
    if (req.params.centerName !== "all") {
      // query._id = req.params.center_id;
      query.centerName = req.params.centerName; // Convert string to ObjectId
    }

    console.log("plantation center_id", req.params.centerName);

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
          console.log("Total Saplings Result:", result);
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

    console.log("Total Plantation Villages:", totalPlantationVillagesCount);
    console.log("Total Plantation Farmers:", totalPlantationFarmersCount);
    console.log("Total Saplings:", totalPlantsCount);
    console.log("Total WRD Villages:", totalWRDVillagesCount);
    console.log("Total WRD Farmers:", totalWRDFarmersCount);
    console.log("Total WRD Objects:", totalWRDCount);

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
