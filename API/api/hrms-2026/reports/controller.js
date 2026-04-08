const mongoose = require("mongoose");
const Approval = require("../approval-details/model.js");
const AnnualPlan = require("../annual-plan/model.js");
const Utilization = require("../utilization-details/model.js");
const FundReceipt = require("../fund-management/model.js");
const Plantation = require("../plantation/model.js");
const WRD = require("../wrd/model.js");
const { response } = require("express");
// const ObjectId = require("mongoose").Types.ObjectId;
const { Types: { ObjectId } } = require('mongoose'); // Destructure to get ObjectId

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
  function safeObjectId(id, label, res) {
    if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
      return new ObjectId(id);
    } else {
      console.error(`Invalid ObjectId for ${label}:`, id);
      res.status(400).json({ error: `Invalid ${label}` });
      throw new Error(`Invalid ${label}`);
    }
  }

  exports.getPlanVsUtilizationReport = async (req, res) => {
    try {
      const {
        activityName_id,
        center_ID,
        fromDate,
        toDate,
        pageNumber,
        program_id,
        project_id,
        quarter,
        recsPerPage,
        searchText,
        subactivityName_id,
        year,
        removePagination = false,
      } = req.body;
    const toObjectId = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);

      const filters = {
        ...(center_ID !== "all" && { center_id: toObjectId(center_ID) }),
        ...(program_id !== "all" && { program_id: toObjectId(program_id) }),
        ...(project_id !== "all" && { project_id: toObjectId(project_id) }),
        ...(activityName_id !== "all" && { activityName_id: toObjectId(activityName_id) }),
        ...(subactivityName_id !== "all" && { subactivityName_id: toObjectId(subactivityName_id) }),
        ...(year !== "all" && { year }),
        ...(quarter !== "all" && { quarter }),
      };

      const plans = await AnnualPlan.find(filters).lean();

      const utilizationFilters = {
        ...(center_ID !== "all" && { center_id: toObjectId(center_ID) }),
        ...(program_id !== "all" && { program_id: toObjectId(program_id) }),
        ...(project_id !== "all" && { project_id: toObjectId(project_id) }),
        ...(activityName_id !== "all" && { activityName_id: toObjectId(activityName_id) }),
        ...(subactivityName_id !== "all" && { subactivityName_id: toObjectId(subactivityName_id) }),
        voucherDate: {
          $gte: fromDate,
          $lte: toDate,
        },
      };

      const utilizations = await Utilization.find(utilizationFilters).lean();

      const planMap = {};
      const utilizationMap = {};
      const comboMeta = {};
      const allCombos = new Set();
      const quarters = ["Q1", "Q2", "Q3", "Q4"];

      for (const plan of plans) {
        const key = `${plan.center_id}_${plan.program_id}_${plan.project_id}_${plan.activityName_id}_${plan.subactivityName_id}`;
        const fullKey = `${key}_${plan.quarter}`;
        planMap[fullKey] = plan;
        allCombos.add(key);
        comboMeta[key] = {
          centerName: plan.centerName,
          program: plan.program,
          project: plan.project,
          activityName: plan.activityName,
          subactivityName: plan.subactivityName,
          unit: plan.unit,
        };
      }

      for (const u of utilizations) {
        const baseKey = `${u.center_id}_${u.program_id}_${u.project_id}_${u.activityName_id}_${u.subactivityName_id}`;
        const voucherDate = u.voucherDate?.split("T")[0];
        const yearQuarters = getQuarterDates(year);

        for (const q of quarters) {
          const { startDate, endDate } = yearQuarters[q];
          if (voucherDate >= startDate && voucherDate <= endDate) {
            const fullKey = `${baseKey}_${q}`;
            if (!utilizationMap[fullKey]) utilizationMap[fullKey] = [];
            utilizationMap[fullKey].push(u);
            allCombos.add(baseKey);
            if (!comboMeta[baseKey]) {
              comboMeta[baseKey] = {
                centerName: u.centerName || "-",
                program: u.program || "-",
                project: u.project || "-",
                activityName: u.activityName || "-",
                subactivityName: u.subactivityName || "-",
                unit: u.unit || "-",
              };
            }
          }
        }
      }

      const report = [];
      for (const combo of allCombos) {
        for (const q of quarters) {
          const fullKey = `${combo}_${q}`;
          const plan = planMap[fullKey];
          const utils = utilizationMap[fullKey] || [];
          const meta = comboMeta[combo] || {};

          const utilization = {
            quantity: 0,
            totalCost: 0,
            LHWRF: 0,
            CC: 0,
            grant: 0,
            convergence: 0,
            households: 0,
            beneficiaries: 0,
          };

          for (const u of utils) {
            utilization.quantity += u.quantity || 0;
            utilization.totalCost += u.totalCost || 0;
            utilization.LHWRF += u.sourceofFund?.LHWRF || 0;
            utilization.CC += u.sourceofFund?.CC || 0;
            utilization.grant += u.sourceofFund?.grant || 0;
            utilization.convergence += u.convergence || 0;
            utilization.households += u.noOfHouseholds || 0;
            utilization.beneficiaries += u.noOfBeneficiaries || 0;
          }

          const planTotal = plan?.totalCost || 0;
          const percentUtilized = planTotal ? ((utilization.totalCost / planTotal) * 100).toFixed(2) : "0.00";
          const balanceCost = planTotal - utilization.totalCost;

          report.push({
            centerName: meta.centerName || "-",
            program: meta.program || "-",
            project: meta.project || "-",
            activityName: meta.activityName || "-",
            subactivityName: meta.subactivityName || "-",
            plannedUnit: meta.unit || "-",
            quarter: q,
            plannedQuantity: plan?.quantity || 0,
            plannedAmount: planTotal,
            plannedLHWRF: plan?.sourceofFund?.LHWRF || 0,
            plannedCC: plan?.sourceofFund?.CC || 0,
            plannedExtGrant: plan?.sourceofFund?.grant || 0,
            plannedConvergence: plan?.convergence || 0,
            plannedNoOfHouseholds: plan?.noOfHouseholds || 0,
            plannedNoOfBeneficiaries: plan?.noOfBeneficiaries || 0,
            totalUtilisedQuantity: utilization.quantity,
            totalUtilisedAmount: utilization.totalCost,
            totalUtilisedLHWRF: utilization.LHWRF,
            totalUtilisedCC: utilization.CC,
            totalUtilisedExtGrant: utilization.grant,
            totalUtilisedConvergence: utilization.convergence,
            totalNoOfHouseholds: utilization.households,
            totalNoOfBeneficiaries: utilization.beneficiaries,
            percentageUtilizedAgainstPlan: percentUtilized,
            balanceAmount: balanceCost,
          });
        }
      }

      const finalData = removePagination
        ? report
        : report.slice((pageNumber - 1) * recsPerPage, pageNumber * recsPerPage);

      const pageTotal = {
        centerName: "Total",
        program: "-",
        project: "-",
        activityName: "-",
        subactivityName: "-",
        plannedUnit: "-",
        quarter: "-",
        plannedQuantity: 0,
        plannedAmount: 0,
        plannedLHWRF: 0,
        plannedCC: 0,
        plannedExtGrant: 0,
        plannedConvergence: 0,
        plannedNoOfHouseholds: 0,
        plannedNoOfBeneficiaries: 0,
        totalUtilisedQuantity: 0,
        totalUtilisedAmount: 0,
        totalUtilisedLHWRF: 0,
        totalUtilisedCC: 0,
        totalUtilisedExtGrant: 0,
        totalUtilisedConvergence: 0,
        totalNoOfHouseholds: 0,
        totalNoOfBeneficiaries: 0,
        percentageUtilizedAgainstPlan: 0,
        balanceAmount: 0,
      };

      for (const row of finalData) {
        pageTotal.plannedQuantity += row.plannedQuantity || 0;
        pageTotal.plannedAmount += row.plannedAmount || 0;
        pageTotal.plannedLHWRF += row.plannedLHWRF || 0;
        pageTotal.plannedCC += row.plannedCC || 0;
        pageTotal.plannedExtGrant += row.plannedExtGrant || 0;
        pageTotal.plannedConvergence += row.plannedConvergence || 0;
        pageTotal.plannedNoOfHouseholds += row.plannedNoOfHouseholds || 0;
        pageTotal.plannedNoOfBeneficiaries += row.plannedNoOfBeneficiaries || 0;
        pageTotal.totalUtilisedQuantity += row.totalUtilisedQuantity || 0;
        pageTotal.totalUtilisedAmount += row.totalUtilisedAmount || 0;
        pageTotal.totalUtilisedLHWRF += row.totalUtilisedLHWRF || 0;
        pageTotal.totalUtilisedCC += row.totalUtilisedCC || 0;
        pageTotal.totalUtilisedExtGrant += row.totalUtilisedExtGrant || 0;
        pageTotal.totalUtilisedConvergence += row.totalUtilisedConvergence || 0;
        pageTotal.totalNoOfHouseholds += row.totalNoOfHouseholds || 0;
        pageTotal.totalNoOfBeneficiaries += row.totalNoOfBeneficiaries || 0;
      }

      pageTotal.percentageUtilizedAgainstPlan = pageTotal.plannedAmount
        ? ((pageTotal.totalUtilisedAmount / pageTotal.plannedAmount) * 100).toFixed(2)
        : "0.00";
      pageTotal.balanceAmount = pageTotal.plannedAmount - pageTotal.totalUtilisedAmount;

      finalData.push(pageTotal);

      return res.status(200).json({
        success: true,
        tableData: finalData,
        totalRecs: report.length,
      });
    } catch (err) {
      console.error("Report Error:", err);
      return res.status(500).json({
        success: false,
        message: "Server Error while generating report",
        error: err.message,
      });
    }
  };
  
  exports.approval_vs_utilization_report = async (req, res) => {
    try {
      const {
        center_ID,
        program_id,
        project_id,
        activityName_id,
        subactivityName_id,
        fromDate,
        toDate,
        recsPerPage,
        pageNumber,
        removePagination,
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


      matchApproval.approvalDate = { $gte: fromDate, $lte: toDate };
      matchUtilization.voucherDate = { $gte: fromDate, $lte: toDate };

      const approvals = await Approval.aggregate([
        { $match: matchApproval },
        {
          $group: {
            _id: {
              center_id: "$center_id",
              program_id: "$program_id",
              project_id: "$project_id",
              activityName_id: "$activityName_id",
              subactivityName_id: "$subactivityName_id",
              approvalNo: "$approvalNo",
              unit: "$unit",
            },
            centerName: { $first: "$centerName" },
            program: { $first: "$program" },
            project: { $first: "$project" },
            activityName: { $first: "$activityName" },
            subactivityName: { $first: "$subactivityName" },
            approvalQuantity: { $sum: "$quantity" },
            totalApprovalAmount: { $sum: "$totalCost" },
            approvalLHWRF: { $sum: "$sourceofFund.LHWRF" },
            approvalCC: { $sum: "$sourceofFund.CC" },
            approvalExtGrant: { $sum: "$sourceofFund.grant" },
            approvalConvergence: { $sum: "$convergence" },
            approvalNoOfHouseholds: { $sum: "$noOfHouseholds" },
            approvalNoOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
          },
        },
      ]);

      const utilization = await Utilization.aggregate([
        { $match: matchUtilization },
        {
          $group: {
            _id: {
              center_id: "$center_id",
              program_id: "$program_id",
              project_id: "$project_id",
              activityName_id: "$activityName_id",
              subactivityName_id: "$subactivityName_id",
              approvalNo: "$approvalNo",
              unit: "$unit",
            },
            centerName: { $first: "$centerName" },
            program: { $first: "$program" },
            project: { $first: "$project" },
            activityName: { $first: "$activityName" },
            subactivityName: { $first: "$subactivityName" },
            totalUtilisedQuantity: { $sum: "$quantity" },
            totalUtilisedAmount: { $sum: "$totalCost" },
            totalUtilisedLHWRF: { $sum: "$sourceofFund.LHWRF" },
            totalUtilisedCC: { $sum: "$sourceofFund.CC" },
            totalUtilisedExtGrant: { $sum: "$sourceofFund.grant" },
            totalConvergence: { $sum: "$convergence" },
            totalNoOfHouseholds: { $sum: "$noOfHouseholds" },
            totalNoOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
          },
        },
      ]);

      const key = doc =>
        `${doc._id.center_id}_${doc._id.program_id}_${doc._id.project_id}_${doc._id.activityName_id}_${doc._id.subactivityName_id}_${doc._id.approvalNo}_${doc._id.unit}`;

      const approvalMap = {};
      approvals.forEach(doc => {
        approvalMap[key(doc)] = doc;
      });

      const utilizationMap = {};
      utilization.forEach(doc => {
        utilizationMap[key(doc)] = doc;
      });

      const allKeys = new Set([...Object.keys(approvalMap), ...Object.keys(utilizationMap)]);
      const report = [];

      for (const k of allKeys) {
        const approval = approvalMap[k] || {};
        const utilizationData = utilizationMap[k] || {};
        const totalApprovalAmount = approval.totalApprovalAmount || 0;
        const totalUtilisedAmount = utilizationData.totalUtilisedAmount || 0;
        const percentageUtilizedAgainstApproval =
          totalApprovalAmount > 0 ? ((totalUtilisedAmount / totalApprovalAmount) * 100).toFixed(2) : 0;
        const balanceAmount = totalApprovalAmount - totalUtilisedAmount;

        report.push({
          centerName: approval.centerName || utilizationData.centerName || "-",
          program: approval.program || utilizationData.program || "-",
          project: approval.project || utilizationData.project || "-",
          activityName: approval.activityName || utilizationData.activityName || "-",
          subactivityName: approval.subactivityName || utilizationData.subactivityName || "-",
          program_id: approval._id?.program_id || utilizationData._id?.program_id || "-",
          project_id: approval._id?.project_id || utilizationData._id?.project_id || "-",
          activityName_id: approval._id?.activityName_id || utilizationData._id?.activityName_id || "-",
          subactivityName_id: approval._id?.subactivityName_id || utilizationData._id?.subactivityName_id || "-",
          approvalNo: approval._id?.approvalNo || utilizationData._id?.approvalNo || "-",
          approvalUnit: approval._id?.unit || utilizationData._id?.unit || "-",
          approvalQuantity: approval.approvalQuantity || 0,
          totalApprovalAmount,
          approvalLHWRF: approval.approvalLHWRF || 0,
          approvalCC: approval.approvalCC || 0,
          approvalExtGrant: approval.approvalExtGrant || 0,
          approvalConvergence: approval.approvalConvergence || 0,
          approvalNoOfHouseholds: approval.approvalNoOfHouseholds || 0,
          approvalNoOfBeneficiaries: approval.approvalNoOfBeneficiaries || 0,
          totalUtilisedQuantity: utilizationData.totalUtilisedQuantity || 0,
          totalUtilisedAmount,
          totalUtilisedLHWRF: utilizationData.totalUtilisedLHWRF || 0,
          totalUtilisedCC: utilizationData.totalUtilisedCC || 0,
          totalUtilisedExtGrant: utilizationData.totalUtilisedExtGrant || 0,
          totalConvergence: utilizationData.totalConvergence || 0,
          totalNoOfHouseholds: utilizationData.totalNoOfHouseholds || 0,
          totalNoOfBeneficiaries: utilizationData.totalNoOfBeneficiaries || 0,
          percentageUtilizedAgainstApproval,
          balanceAmount,
        });
      }

      const totalRecords = report.length;
      let paginatedData = report;

      if (!removePagination) {
        const skip = (parseInt(pageNumber) - 1) * parseInt(recsPerPage);
        paginatedData = report.slice(skip, skip + parseInt(recsPerPage));
      }

      const totalRow = {
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
      };

      [
        "approvalQuantity",
        "totalApprovalAmount",
        "approvalLHWRF",
        "approvalCC",
        "approvalExtGrant",
        "approvalConvergence",
        "approvalNoOfHouseholds",
        "approvalNoOfBeneficiaries",
        "totalUtilisedQuantity",
        "totalUtilisedAmount",
        "totalUtilisedLHWRF",
        "totalUtilisedCC",
        "totalUtilisedExtGrant",
        "totalConvergence",
        "totalNoOfHouseholds",
        "totalNoOfBeneficiaries",
        "balanceAmount",
      ].forEach(field => {
        totalRow[field] = paginatedData.reduce((acc, row) => acc + (parseFloat(row[field]) || 0), 0);
      });

      totalRow.percentageUtilizedAgainstApproval =
        totalRow.totalApprovalAmount > 0
          ? ((totalRow.totalUtilisedAmount / totalRow.totalApprovalAmount) * 100).toFixed(2)
          : 0;

      const finalData = [...paginatedData, totalRow];

      res.status(200).json({ tableData: finalData, totalRecs: totalRecords, success: true });
    } catch (err) {
      console.log("err", err);
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  };

  exports.approval_vs_utilization_report1 = (req, res, next) => {
    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);
    var query = "1";
    var query = {};
    if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
      query.approvalSubmissionDate = {
        $gte: req.body.fromDate,
        $lte: req.body.toDate,
      };
    }
    // console.log("req.body.center_ID", req.body.center_ID);

    if (req.body.center_ID !== "all")
      query.center_id = new ObjectId(req.body.center_ID);

    if (req.body.program_id !== "all") {
      query.program_id = new ObjectId(req.body.program_id);
    }
    if (req.body.project_id !== "all") {
      query.project_id = new ObjectId(req.body.project_id);
    }
    if (req.body.activityName_id !== "all") {
      query.activityName_id = new ObjectId(req.body.activityName_id);
    }
    if (req.body.subactivityName_id !== "all") {
      query.subactivityName_id = new ObjectId(req.body.subactivityName_id);
    }

    // search text condition
    // console.log("req.body", req.body);
    // console.log("query", query);
    if (req.body.searchText !== "-") {
      const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
      query.$or = [
        { centerName: searchRegex },
        { program: searchRegex },
        { project: searchRegex },
        { activityName: searchRegex },
        { subactivityName: searchRegex },
        { unit: searchRegex },
      ];
    }
    // console.log("query", query);
    let paginationStages = [{ $sort: { centerName: 1 } }];

    if (!req.body.removePagination) {
      paginationStages.push(
        { $skip: parseInt(skipRec) },
        { $limit: parseInt(recsPerPage) }
      );
    }
    Approval.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "utilizationdetails",
          localField: "approvalNo",
          foreignField: "approvalNo",
          as: "utilizationData",
        },
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
          approvalNo: 1,
          approvalUnit: "$unit",
          approvalQuantity: { $ifNull: ["$quantity", 0] },
          totalApprovalAmount: { $ifNull: ["$totalCost", 0] },
          approvalLHWRF: { $ifNull: ["$sourceofFund.LHWRF", 0] },
          approvalCC: { $ifNull: ["$sourceofFund.CC", 0] },
          approvalExtGrant: { $ifNull: ["$sourceofFund.grant", 0] },
          approvalNoOfHouseholds: { $ifNull: ["$noOfHouseholds", 0] },
          approvalNoOfBeneficiaries: { $ifNull: ["$noOfBeneficiaries", 0] },
          approvalConvergence: { $ifNull: ["$convergence", 0] },
          utilizationData: 1, // keep the array as is
        },
      },
      {
        $addFields: {
          totalUtilisedQuantity: {
            $sum: {
              $map: {
                input: "$utilizationData",
                as: "u",
                in: { $ifNull: ["$$u.quantity", 0] },
              },
            },
          },
          totalUtilisedAmount: {
            $sum: {
              $map: {
                input: "$utilizationData",
                as: "u",
                in: { $ifNull: ["$$u.totalCost", 0] },
              },
            },
          },
          totalUtilisedLHWRF: {
            $sum: {
              $map: {
                input: "$utilizationData",
                as: "u",
                in: { $ifNull: ["$$u.sourceofFund.LHWRF", 0] },
              },
            },
          },
          totalUtilisedCC: {
            $sum: {
              $map: {
                input: "$utilizationData",
                as: "u",
                in: { $ifNull: ["$$u.sourceofFund.CC", 0] },
              },
            },
          },
          totalUtilisedExtGrant: {
            $sum: {
              $map: {
                input: "$utilizationData",
                as: "u",
                in: { $ifNull: ["$$u.sourceofFund.grant", 0] },
              },
            },
          },
          totalConvergence: {
            $sum: {
              $map: {
                input: "$utilizationData",
                as: "u",
                in: { $ifNull: ["$$u.convergence", 0] },
              },
            },
          },
          totalNoOfHouseholds: {
            $sum: {
              $map: {
                input: "$utilizationData",
                as: "u",
                in: { $ifNull: ["$$u.noOfHouseholds", 0] },
              },
            },
          },
          totalNoOfBeneficiaries: {
            $sum: {
              $map: {
                input: "$utilizationData",
                as: "u",
                in: { $ifNull: ["$$u.noOfBeneficiaries", 0] },
              },
            },
          },
        },
      },
      {
        $project: {
          percentageUtilizedAgainstApproval: {
            $cond: [
              { $eq: ["$totalApprovalAmount", 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: ["$totalUtilisedAmount", "$totalApprovalAmount"],
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
            $subtract: ["$totalApprovalAmount", "$totalUtilisedAmount"],
          },
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
          approvalNo: 1,
          approvalUnit: 1,
          approvalQuantity: 1,
          totalApprovalAmount: 1,
          approvalLHWRF: 1,
          approvalCC: 1,
          approvalExtGrant: 1,
          approvalConvergence: 1,
          approvalNoOfHouseholds: 1,
          approvalNoOfBeneficiaries: 1,
          totalUtilisedQuantity: 1,
          totalUtilisedAmount: 1,
          totalUtilisedLHWRF: 1,
          totalUtilisedCC: 1,
          totalUtilisedExtGrant: 1,
          totalConvergence: 1,
          totalNoOfHouseholds: 1,
          totalNoOfBeneficiaries: 1,
        },
      },
      {
        $facet: {
          totalRecords: [{ $count: "count" }],
          paginatedData: paginationStages,
        },
      },
      {
        $project: {
          totalRecords: {
            $ifNull: [{ $arrayElemAt: ["$totalRecords.count", 0] }, 0],
          },
          paginatedData: 1,
        },
      },
    ])
      .then((response) => {
        var data = response[0].paginatedData;
        // console.log("response[0]", response[0].totalRecords);
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
          totalRecs: response[0].totalRecords,
          success: true,
        });
        // console.log("response[0]", response[0].totalRecords);
      })
      .catch((error) => {
        console.log("Error in ApprovalList  => ", error);
        res.status(500).json({ errorMsg: error.message, success: false });
      });
  };
  //created to find utilization records that do not have any matching plans -just for defect resolution
  // frontend url - utilization-without-plan
  exports.plan_vs_utilization_report_defect_data_having_no_plans = async (req, res, next) => {

    try {

      let recsPerPage = req.body.recsPerPage;
      let pageNum = req.body.pageNumber;
      let skipRec = recsPerPage * (pageNum - 1);
      var query = {};

      // console.log("req.body", req.body);

      if (req.body.center_id !== "all")
        query.center_id = new ObjectId(req.body.center_id);

      let paginationStages = [{ $sort: { centerName: 1 } }];

      if (!req.body.removePagination) {
        paginationStages.push(
          { $skip: parseInt(skipRec) },
          { $limit: parseInt(recsPerPage) }
        );
      }
      // console.log("query", query)
      const data = await Utilization.aggregate([
        {
          $match: query, // Filter approvals based on query
        }, {
          $lookup: {
            from: 'annualplans',
            let: {
              center_id: '$center_id',
              program_id: '$program_id',
              project_id: '$project_id',
              activityName_id: '$activityName_id',
              subactivityName_id: '$subactivityName_id',
              voucherDate: '$voucherDate'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$$center_id', '$center_id'] },
                      { $eq: ['$$program_id', '$program_id'] },
                      { $eq: ['$$project_id', '$project_id'] },
                      { $eq: ['$$activityName_id', '$activityName_id'] },
                      { $eq: ['$$subactivityName_id', '$subactivityName_id'] },
                      { $lte: ['$$voucherDate', '$endDate'] },
                      { $gte: ['$$voucherDate', '$startDate'] }
                    ]
                  }
                }
              }
            ],
            as: 'matchedPlans'
          }
        },
        {
          $match: {
            matchedPlans: { $eq: [] }
          }
        },
        {
          $project: {
            _id: 1,
            centerName: 1,
            program: 1,
            project: 1,
            activityName: 1,
            subactivityName: 1,
            voucherDate: 1,
            voucherNumber: 1,
            unit: 1,
            quantity: 1,
            unitCost: 1,
            totalCost: 1,
            sourceofFund: 1,
            convergence: 1,
            noOfHouseholds: 1,
            noOfBeneficiaries: 1,
            status: 1,
            createdAt: 1
          }
        },
        {
          $facet: {
            totalRecords: [{ $count: "count" }],
            paginatedData: paginationStages,
          },
        },
        {
          $project: {
            totalRecords: {
              $ifNull: [{ $arrayElemAt: ["$totalRecords.count", 0] }, 0],
            },
            paginatedData: 1,
          },
        },
      ]);
      // console.log("Data with no matching plans:", data[0].totalRecords);
      res.status(200).json({
        tableData: data[0].paginatedData,
        totalRecs: data[0].totalRecords,
        success: true,
      });
    } catch (error) {
      console.error('Error in utilization without plan:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };


  async function plan_vs_utilizationAggregateData11(query, quarter, startDate, endDate, paginatedDataStages) {
    return new Promise((resolve, reject) => {
      // console.log("query 2", JSON.stringify(query, null, 2));
      // console.log("quarter, startDate, endDate, paginatedDataStages", quarter, startDate, endDate, paginatedDataStages);
      const quarters = ["Q1", "Q2", "Q3", "Q4"];

      AnnualPlan.aggregate([
        {
          $match: {
            $and: [
              quarter === "all" ? query : { ...query, quarter },
              {
                $or: [
                  { quantity: { $ne: "" } },
                  { totalCost: { $ne: "" } },
                  { "sourceofFund.LHWRF": { $ne: "" } },
                  { "sourceofFund.CC": { $ne: "" } },
                  { "sourceofFund.grant": { $ne: "" } },
                  { convergence: { $ne: "" } },
                  { noOfHouseholds: { $ne: "" } },
                  { noOfBeneficiaries: { $ne: "" } }
                ]
              }
            ].filter(Boolean)
          },
        },
        {
          $project: {
            centerName: 1,
            program: 1,
            project: 1,
            activityName: 1,
            subactivityName: 1,
            unit: 1,
            quarter: 1,
            quantity: { $ifNull: [{ $toDouble: { $ifNull: ["$quantity", "0"] } }, 0] },
            totalCost: { $ifNull: [{ $toDouble: { $ifNull: ["$totalCost", "0"] } }, 0] },
            "sourceofFund.LHWRF": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.LHWRF", "0"] } }, 0] },
            "sourceofFund.CC": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.CC", "0"] } }, 0] },
            "sourceofFund.grant": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.grant", "0"] } }, 0] },
            convergence: { $ifNull: [{ $toDouble: { $ifNull: ["$convergence", "0"] } }, 0] },
            noOfHouseholds: { $ifNull: [{ $toInt: { $ifNull: ["$noOfHouseholds", "0"] } }, 0] },
            noOfBeneficiaries: { $ifNull: [{ $toInt: { $ifNull: ["$noOfBeneficiaries", "0"] } }, 0] },
            center_id: 1,
            program_id: 1,
            project_id: 1,
            activityName_id: 1,
            subactivityName_id: 1,
          },
        },
        {
          $lookup: {
            from: "utilizationdetails",
            let: {
              center_id: "$center_id",
              program_id: "$program_id",
              project_id: "$project_id",
              activityName_id: "$activityName_id",
              subactivityName_id: "$subactivityName_id",
              utilStartDate: startDate,
              utilEndDate: endDate,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$center_id", "$$center_id"] },
                      { $eq: ["$program_id", "$$program_id"] },
                      { $eq: ["$project_id", "$$project_id"] },
                      { $eq: ["$activityName_id", "$$activityName_id"] },
                      { $eq: ["$subactivityName_id", "$$subactivityName_id"] },
                      { $gte: ["$voucherDate", "$$utilStartDate"] },
                      { $lte: ["$voucherDate", "$$utilEndDate"] },
                    ].filter(Boolean),
                  },
                },
              },
              {
                $project: {
                  quantity: { $ifNull: [{ $toDouble: { $ifNull: ["$quantity", "0"] } }, 0] },
                  totalCost: { $ifNull: [{ $toDouble: { $ifNull: ["$totalCost", "0"] } }, 0] },
                  "sourceofFund.LHWRF": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.LHWRF", "0"] } }, 0] },
                  "sourceofFund.grant": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.grant", "0"] } }, 0] },
                  "sourceofFund.CC": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.CC", "0"] } }, 0] },
                  convergence: { $ifNull: [{ $toDouble: { $ifNull: ["$convergence", "0"] } }, 0] },
                  noOfHouseholds: { $ifNull: [{ $toInt: { $ifNull: ["$noOfHouseholds", "0"] } }, 0] },
                  noOfBeneficiaries: { $ifNull: [{ $toInt: { $ifNull: ["$noOfBeneficiaries", "0"] } }, 0] },
                  voucherDate: 1,
                },
              },
              {
                $group: {
                  _id: { $let: { vars: { date: { $toDate: "$voucherDate" } }, in: getQuarterFromDate("$voucherDate") } },
                  quantity: { $sum: "$quantity" },
                  totalUtilizedAmount: { $sum: "$totalCost" },
                  utilized_LHWRF: { $sum: "$sourceofFund.LHWRF" },
                  utilized_Grant: { $sum: "$sourceofFund.grant" },
                  utilized_CC: { $sum: "$sourceofFund.CC" },
                  utilized_Convergence: { $sum: "$convergence" },
                  noOfHouseholds: { $sum: "$noOfHouseholds" },
                  noOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
                },
              },
              {
                $project: {
                  quarter: "$_id",
                  quantity: 1,
                  totalUtilizedAmount: 1,
                  utilized_LHWRF: 1,
                  utilized_Grant: 1,
                  utilized_CC: 1,
                  utilized_Convergence: 1,
                  noOfHouseholds: 1,
                  noOfBeneficiaries: 1,
                },
              },
            ],
            as: "utilizationData",
          },
        },
        {
          $unwind: { path: "$utilizationData", preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: {
              centerName: "$centerName",
              program: "$program",
              project: "$project",
              activityName: "$activityName",
              subactivityName: "$subactivityName",
              plannedUnit: "$unit",
              quarter: { $ifNull: ["$utilizationData.quarter", "$quarter"] },
            },
            plannedQuantity: { $sum: "$quantity" },
            plannedAmount: { $sum: "$totalCost" },
            plannedLHWRF: { $sum: "$sourceofFund.LHWRF" },
            plannedCC: { $sum: "$sourceofFund.CC" },
            plannedExtGrant: { $sum: "$sourceofFund.grant" },
            plannedConvergence: { $sum: "$convergence" },
            plannedNoOfHouseholds: { $sum: "$noOfHouseholds" },
            plannedNoOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
            totalUtilisedQuantity: { $sum: { $ifNull: ["$utilizationData.quantity", 0] } },
            totalUtilisedAmount: { $sum: { $ifNull: ["$utilizationData.totalUtilizedAmount", 0] } },
            totalUtilisedLHWRF: { $sum: { $ifNull: ["$utilizationData.utilized_LHWRF", 0] } },
            totalUtilisedCC: { $sum: { $ifNull: ["$utilizationData.utilized_Grant", 0] } },
            totalUtilisedExtGrant: { $sum: { $ifNull: ["$utilizationData.utilized_CC", 0] } },
            totalUtilisedConvergence: { $sum: { $ifNull: ["$utilizationData.utilized_Convergence", 0] } },
            totalNoOfHouseholds: { $sum: { $ifNull: ["$utilizationData.noOfHouseholds", 0] } },
            totalNoOfBeneficiaries: { $sum: { $ifNull: ["$utilizationData.noOfBeneficiaries", 0] } },
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
            plannedUnit: "$_id.plannedUnit",
            quarter: "$_id.quarter",
            plannedQuantity: { $ifNull: ["$plannedQuantity", 0] },
            plannedAmount: { $ifNull: ["$plannedAmount", 0] },
            plannedLHWRF: { $ifNull: ["$plannedLHWRF", 0] },
            plannedCC: { $ifNull: ["$plannedCC", 0] },
            plannedExtGrant: { $ifNull: ["$plannedExtGrant", 0] },
            plannedConvergence: { $ifNull: ["$plannedConvergence", 0] },
            plannedNoOfHouseholds: { $ifNull: ["$plannedNoOfHouseholds", 0] },
            plannedNoOfBeneficiaries: { $ifNull: ["$plannedNoOfBeneficiaries", 0] },
            totalUtilisedQuantity: { $ifNull: ["$totalUtilisedQuantity", 0] },
            totalUtilisedAmount: { $ifNull: ["$totalUtilisedAmount", 0] },
            totalUtilisedLHWRF: { $ifNull: ["$totalUtilisedLHWRF", 0] },
            totalUtilisedCC: { $ifNull: ["$totalUtilisedCC", 0] },
            totalUtilisedExtGrant: { $ifNull: ["$totalUtilisedExtGrant", 0] },
            totalUtilisedConvergence: { $ifNull: ["$totalUtilisedConvergence", 0] },
            totalNoOfHouseholds: { $ifNull: ["$totalNoOfHouseholds", 0] },
            totalNoOfBeneficiaries: { $ifNull: ["$totalNoOfBeneficiaries", 0] },
          },
        },
        {
          $addFields: {
            quarterOrder: {
              $toInt: {
                $cond: [
                  { $regexMatch: { input: "$quarter", regex: /^Q[1-4]$/ } },
                  { $substr: ["$quarter", 1, -1] },
                  "1" // Default to 1 (Q1) if quarter is invalid
                ]
              }
            },
          },
        },
        {
          $addFields: {
            percentageUtilizedAgainstPlan: {
              $cond: [
                { $gt: [{ $ifNull: ["$plannedAmount", 0] }, 0] },
                { $round: [{ $multiply: [{ $divide: [{ $ifNull: ["$totalUtilisedAmount", 0] }, { $ifNull: ["$plannedAmount", 0] }] }, 100] }, 2] },
                0
              ],
            },
            balanceAmount: { $subtract: ["$plannedAmount", { $ifNull: ["$totalUtilisedAmount", 0] }] },
          },
        },
        { $facet: { totalRecords: [{ $count: "count" }], paginatedData: paginatedDataStages } },
        {
          $project: {
            totalRecords: { $ifNull: [{ $arrayElemAt: ["$totalRecords.count", 0] }, 0] },
            paginatedData: 1,
          },
        },
      ]).then((result) => {
        // console.log("Aggregation Result:", JSON.stringify(result, null, 2)); // Debug log
        resolve(result);
      }).catch(reject);
    });
  }
  async function plan_vs_utilizationAggregateDataOOO(query, quarter, startDate, endDate, paginatedDataStages) {
    return new Promise((resolve, reject) => {
      // console.log("query 2", JSON.stringify(query, null, 2));
      // console.log("quarter, startDate, endDate, paginatedDataStages", quarter, startDate, endDate, paginatedDataStages);
      const year = query.year; // Default to "2025-26" if year is not provided in query
      const quarterDates = getQuarterDates(year);

      // AnnualPlan.aggregate([
      // {
      //   $match: {
      //     $and: [
      //       quarter === "all" ? query : { ...query, quarter },
      //       { $or: [
      //         { quantity: { $ne: "" } },
      //         { totalCost: { $ne: "" } },
      //         { "sourceofFund.LHWRF": { $ne: "" } },
      //         { "sourceofFund.CC": { $ne: "" } },
      //         { "sourceofFund.grant": { $ne: "" } },
      //         { convergence: { $ne: "" } },
      //         { noOfHouseholds: { $ne: "" } },
      //         { noOfBeneficiaries: { $ne: "" } }
      //       ] }
      //     ].filter(Boolean)
      //   },
      // },
      // {
      //   $project: {
      //     centerName: 1,
      //     program: 1,
      //     project: 1,
      //     activityName: 1,
      //     subactivityName: 1,
      //     unit: 1,
      //     quarter: { $ifNull: ["$quarter", "Q1"] }, // Default to Q1 if quarter is missing
      //     quantity: { $ifNull: [{ $toDouble: { $ifNull: ["$quantity", "0"] } }, 0] },
      //     totalCost: { $ifNull: [{ $toDouble: { $ifNull: ["$totalCost", "0"] } }, 0] },
      //     "sourceofFund.LHWRF": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.LHWRF", "0"] } }, 0] },
      //     "sourceofFund.CC": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.CC", "0"] } }, 0] },
      //     "sourceofFund.grant": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.grant", "0"] } }, 0] },
      //     convergence: { $ifNull: [{ $toDouble: { $ifNull: ["$convergence", "0"] } }, 0] },
      //     noOfHouseholds: { $ifNull: [{ $toInt: { $ifNull: ["$noOfHouseholds", "0"] } }, 0] },
      //     noOfBeneficiaries: { $ifNull: [{ $toInt: { $ifNull: ["$noOfBeneficiaries", "0"] } }, 0] },
      //     center_id: 1,
      //     program_id: 1,
      //     project_id: 1,
      //     activityName_id: 1,
      //     subactivityName_id: 1,
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "utilizationdetails",
      //     let: {
      //       center_id: "$center_id",
      //       program_id: "$program_id",
      //       project_id: "$project_id",
      //       activityName_id: "$activityName_id",
      //       subactivityName_id: "$subactivityName_id",
      //       utilStartDate: startDate,
      //       utilEndDate: endDate,
      //     },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ["$center_id", "$$center_id"] },
      //               { $eq: ["$program_id", "$$program_id"] },
      //               { $eq: ["$project_id", "$$project_id"] },
      //               { $eq: ["$activityName_id", "$$activityName_id"] },
      //               { $eq: ["$subactivityName_id", "$$subactivityName_id"] },
      //               { $gte: ["$voucherDate", "$$utilStartDate"] },
      //               { $lte: ["$voucherDate", "$$utilEndDate"] },
      //             ].filter(Boolean),
      //           },
      //         },
      //       },
      //       {
      //         $project: {
      //           quantity: { $ifNull: [{ $toDouble: { $ifNull: ["$quantity", "0"] } }, 0] },
      //           totalCost: { $ifNull: [{ $toDouble: { $ifNull: ["$totalCost", "0"] } }, 0] },
      //           "sourceofFund.LHWRF": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.LHWRF", "0"] } }, 0] },
      //           "sourceofFund.grant": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.grant", "0"] } }, 0] },
      //           "sourceofFund.CC": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.CC", "0"] } }, 0] },
      //           convergence: { $ifNull: [{ $toDouble: { $ifNull: ["$convergence", "0"] } }, 0] },
      //           noOfHouseholds: { $ifNull: [{ $toInt: { $ifNull: ["$noOfHouseholds", "0"] } }, 0] },
      //           noOfBeneficiaries: { $ifNull: [{ $toInt: { $ifNull: ["$noOfBeneficiaries", "0"] } }, 0] },
      //           voucherDate: 1,
      //         },
      //       },
      //       {
      //         $group: {
      //           _id: { $let: { vars: { date: { $toDate: "$voucherDate" } }, in: getQuarterFromDate("$voucherDate") } },
      //           quantity: { $sum: "$quantity" },
      //           totalUtilizedAmount: { $sum: "$totalCost" },
      //           utilized_LHWRF: { $sum: "$sourceofFund.LHWRF" },
      //           utilized_Grant: { $sum: "$sourceofFund.grant" },
      //           utilized_CC: { $sum: "$sourceofFund.CC" },
      //           utilized_Convergence: { $sum: "$convergence" },
      //           noOfHouseholds: { $sum: "$noOfHouseholds" },
      //           noOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
      //         },
      //       },
      //       {
      //         $project: {
      //           quarter: "$_id",
      //           quantity: 1,
      //           totalUtilizedAmount: 1,
      //           utilized_LHWRF: 1,
      //           utilized_Grant: 1,
      //           utilized_CC: 1,
      //           utilized_Convergence: 1,
      //           noOfHouseholds: 1,
      //           noOfBeneficiaries: 1,
      //         },
      //       },
      //     ],
      //     as: "utilizationData",
      //   },
      // },
      AnnualPlan.aggregate([
        {
          $match: {
            $and: [
              quarter === "all" ? { ...query, quarter } : { ...query, quarter },
              // Removed the $or condition to include plans with 0 values
            ].filter(Boolean)
          },
        },
        {
          $project: {
            centerName: 1,
            program: 1,
            project: 1,
            activityName: 1,
            subactivityName: 1,
            unit: 1,
            quarter: { $ifNull: ["$quarter", quarter] },

            // quarter: { $ifNull: ["$quarter", "Q1"] }, // Default to Q1 if quarter is missing
            quantity: { $ifNull: [{ $toDouble: { $ifNull: ["$quantity", "0"] } }, 0] },
            totalCost: { $ifNull: [{ $toDouble: { $ifNull: ["$totalCost", "0"] } }, 0] },
            LHWRF: { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.LHWRF", "0"] } }, 0] },
            CC: { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.CC", "0"] } }, 0] },
            grant: { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.grant", "0"] } }, 0] },
            convergence: { $ifNull: [{ $toDouble: { $ifNull: ["$convergence", "0"] } }, 0] },
            noOfHouseholds: { $ifNull: [{ $toInt: { $ifNull: ["$noOfHouseholds", "0"] } }, 0] },
            noOfBeneficiaries: { $ifNull: [{ $toInt: { $ifNull: ["$noOfBeneficiaries", "0"] } }, 0] },
            center_id: 1,
            program_id: 1,
            project_id: 1,
            activityName_id: 1,
            subactivityName_id: 1,
          },
        },
        {
          $lookup: {
            from: "utilizationdetails",
            let: {
              center_id: "$center_id",
              program_id: "$program_id",
              project_id: "$project_id",
              activityName_id: "$activityName_id",
              subactivityName_id: "$subactivityName_id",
              utilStartDate: quarter === "all" ? {
                $switch: {
                  branches: [
                    { case: { $eq: ["$quarter", "Q1"] }, then: quarterDates.Q1.startDate },
                    { case: { $eq: ["$quarter", "Q2"] }, then: quarterDates.Q2.startDate },
                    { case: { $eq: ["$quarter", "Q3"] }, then: quarterDates.Q3.startDate },
                    { case: { $eq: ["$quarter", "Q4"] }, then: quarterDates.Q4.startDate },
                  ],
                  default: startDate
                }
              } : startDate,
              utilEndDate: quarter === "all" ? {
                $switch: {
                  branches: [
                    { case: { $eq: ["$quarter", "Q1"] }, then: quarterDates.Q1.endDate },
                    { case: { $eq: ["$quarter", "Q2"] }, then: quarterDates.Q2.endDate },
                    { case: { $eq: ["$quarter", "Q3"] }, then: quarterDates.Q3.endDate },
                    { case: { $eq: ["$quarter", "Q4"] }, then: quarterDates.Q4.endDate },
                  ],
                  default: endDate
                }
              } : endDate,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$center_id", "$$center_id"] },
                      { $eq: ["$program_id", "$$program_id"] },
                      { $eq: ["$project_id", "$$project_id"] },
                      { $eq: ["$activityName_id", "$$activityName_id"] },
                      { $eq: ["$subactivityName_id", "$$subactivityName_id"] },
                      { $gte: ["$voucherDate", "$$utilStartDate"] },
                      { $lte: ["$voucherDate", "$$utilEndDate"] },
                    ].filter(Boolean),
                  },
                },
              },
              {
                $project: {
                  quantity: { $ifNull: [{ $toDouble: { $ifNull: ["$quantity", "0"] } }, 0] },
                  totalCost: { $ifNull: [{ $toDouble: { $ifNull: ["$totalCost", "0"] } }, 0] },
                  "sourceofFund.LHWRF": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.LHWRF", "0"] } }, 0] },
                  "sourceofFund.grant": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.grant", "0"] } }, 0] },
                  "sourceofFund.CC": { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.CC", "0"] } }, 0] },
                  convergence: { $ifNull: [{ $toDouble: { $ifNull: ["$convergence", "0"] } }, 0] },
                  noOfHouseholds: { $ifNull: [{ $toInt: { $ifNull: ["$noOfHouseholds", "0"] } }, 0] },
                  noOfBeneficiaries: { $ifNull: [{ $toInt: { $ifNull: ["$noOfBeneficiaries", "0"] } }, 0] },
                  voucherDate: 1,
                },
              },
              {
                $group: {
                  _id: { $let: { vars: { date: { $toDate: "$voucherDate" } }, in: getQuarterFromDate("$voucherDate") } },
                  quantity: { $sum: "$quantity" },
                  totalUtilizedAmount: { $sum: "$totalCost" },
                  utilized_LHWRF: { $sum: "$sourceofFund.LHWRF" },
                  utilized_Grant: { $sum: "$sourceofFund.grant" },
                  utilized_CC: { $sum: "$sourceofFund.CC" },
                  utilized_Convergence: { $sum: "$convergence" },
                  noOfHouseholds: { $sum: "$noOfHouseholds" },
                  noOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
                },
              },
              {
                $project: {
                  quarter: "$_id",
                  quantity: 1,
                  totalUtilizedAmount: 1,
                  utilized_LHWRF: 1,
                  utilized_Grant: 1,
                  utilized_CC: 1,
                  utilized_Convergence: 1,
                  noOfHouseholds: 1,
                  noOfBeneficiaries: 1,
                },
              },
            ],
            as: "utilizationData",
          },
        },

        {
          $unwind: { path: "$utilizationData", preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: {
              centerName: "$centerName",
              program: "$program",
              project: "$project",
              activityName: "$activityName",
              subactivityName: "$subactivityName",
              plannedUnit: "$unit",
              plannedQuarter: "$quarter", // Use AnnualPlan's quarter for planned values
              utilizedQuarter: "$utilizationData.quarter", // Use utilization's quarter for utilized values
            },
            plannedQuantity: { $sum: "$quantity" },
            plannedAmount: { $sum: "$totalCost" },
            plannedLHWRF: { $sum: "$sourceofFund.LHWRF" },
            plannedCC: { $sum: "$sourceofFund.CC" },
            plannedExtGrant: { $sum: "$sourceofFund.grant" },
            plannedConvergence: { $sum: "$convergence" },
            plannedNoOfHouseholds: { $sum: "$noOfHouseholds" },
            plannedNoOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
            totalUtilisedQuantity: { $sum: { $ifNull: ["$utilizationData.quantity", 0] } },
            totalUtilisedAmount: { $sum: { $ifNull: ["$utilizationData.totalUtilizedAmount", 0] } },
            totalUtilisedLHWRF: { $sum: { $ifNull: ["$utilizationData.utilized_LHWRF", 0] } },
            totalUtilisedCC: { $sum: { $ifNull: ["$utilizationData.utilized_Grant", 0] } },
            totalUtilisedExtGrant: { $sum: { $ifNull: ["$utilizationData.utilized_CC", 0] } },
            totalUtilisedConvergence: { $sum: { $ifNull: ["$utilizationData.utilized_Convergence", 0] } },
            totalNoOfHouseholds: { $sum: { $ifNull: ["$utilizationData.noOfHouseholds", 0] } },
            totalNoOfBeneficiaries: { $sum: { $ifNull: ["$utilizationData.noOfBeneficiaries", 0] } },
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
            plannedUnit: "$_id.plannedUnit",
            quarter: "$_id.plannedQuarter", // Use planned quarter for the output
            plannedQuantity: { $ifNull: ["$plannedQuantity", 0] },
            plannedAmount: { $ifNull: ["$plannedAmount", 0] },
            plannedLHWRF: { $ifNull: ["$plannedLHWRF", 0] },
            plannedCC: { $ifNull: ["$plannedCC", 0] },
            plannedExtGrant: { $ifNull: ["$plannedExtGrant", 0] },
            plannedConvergence: { $ifNull: ["$plannedConvergence", 0] },
            plannedNoOfHouseholds: { $ifNull: ["$plannedNoOfHouseholds", 0] },
            plannedNoOfBeneficiaries: { $ifNull: ["$plannedNoOfBeneficiaries", 0] },
            totalUtilisedQuantity: { $ifNull: ["$totalUtilisedQuantity", 0] },
            totalUtilisedAmount: { $ifNull: ["$totalUtilisedAmount", 0] },
            totalUtilisedLHWRF: { $ifNull: ["$totalUtilisedLHWRF", 0] },
            totalUtilisedCC: { $ifNull: ["$totalUtilisedCC", 0] },
            totalUtilisedExtGrant: { $ifNull: ["$totalUtilisedExtGrant", 0] },
            totalUtilisedConvergence: { $ifNull: ["$totalUtilisedConvergence", 0] },
            totalNoOfHouseholds: { $ifNull: ["$totalNoOfHouseholds", 0] },
            totalNoOfBeneficiaries: { $ifNull: ["$totalNoOfBeneficiaries", 0] },
          },
        },
        {
          $addFields: {
            quarterOrder: {
              $toInt: {
                $cond: [
                  { $regexMatch: { input: "$quarter", regex: /^Q[1-4]$/ } },
                  { $substr: ["$quarter", 1, -1] },
                  "1" // Default to 1 (Q1) if quarter is invalid
                ]
              }
            },
          },
        },
        {
          $addFields: {
            percentageUtilizedAgainstPlan: {
              $cond: [
                { $gt: [{ $ifNull: ["$plannedAmount", 0] }, 0] },
                { $round: [{ $multiply: [{ $divide: [{ $ifNull: ["$totalUtilisedAmount", 0] }, { $ifNull: ["$plannedAmount", 0] }] }, 100] }, 2] },
                0
              ],
            },
            balanceAmount: { $subtract: ["$plannedAmount", { $ifNull: ["$totalUtilisedAmount", 0] }] },
          },
        },
        { $facet: { totalRecords: [{ $count: "count" }], paginatedData: paginatedDataStages } },
        {
          $project: {
            totalRecords: { $ifNull: [{ $arrayElemAt: ["$totalRecords.count", 0] }, 0] },
            paginatedData: 1,
          },
        },
      ]).then((result) => {
        // console.log("Aggregation Result:", JSON.stringify(result, null, 2)); // Debug log
        resolve(result);
      }).catch(reject);
    });
  }

  function getQuarterFromDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth(); // 0-based (0 = January, 3 = April, etc.)
    if (month >= 3 && month <= 5) return 'Q1'; // April to June
    if (month >= 6 && month <= 8) return 'Q2'; // July to September
    if (month >= 9 && month <= 11) return 'Q3'; // October to December
    return 'Q4'; // January to March
  }

  function getQuarterDates(year) {
    const [startYear, endYear] = year.split('-').map(Number);
    return {
      Q1: { startDate: new Date(startYear, 3, 1).toISOString().split('T')[0], endDate: new Date(startYear, 5, 30).toISOString().split('T')[0] }, // April 1 - June 30
      Q2: { startDate: new Date(startYear, 6, 1).toISOString().split('T')[0], endDate: new Date(startYear, 8, 30).toISOString().split('T')[0] }, // July 1 - September 30
      Q3: { startDate: new Date(startYear, 9, 1).toISOString().split('T')[0], endDate: new Date(startYear, 11, 31).toISOString().split('T')[0] }, // October 1 - December 31
      Q4: { startDate: new Date(startYear + 1, 0, 1).toISOString().split('T')[0], endDate: new Date(startYear + 1, 2, 31).toISOString().split('T')[0] }, // January 1 - March 31
    };
  }

  async function plan_vs_utilizationAggregateData1(query, quarter, startDate, endDate, paginatedDataStages) {
    return new Promise((resolve, reject) => {
      // console.log("query 2", JSON.stringify(query, null, 2));
      // console.log("quarter, startDate, endDate, paginatedDataStages", quarter, startDate, endDate, paginatedDataStages);
      const year = query.year // Default to "2025-26" if year is not provided in query
      const quarterDates = getQuarterDates(year);

      AnnualPlan.aggregate([
        {
          $match: {
            $and: [
              quarter === "all" ? query : { ...query, quarter },
              // Removed the $or condition to include plans with 0 values
            ].filter(Boolean)
          },
        },
        {
          $project: {
            centerName: 1,
            program: 1,
            project: 1,
            activityName: 1,
            subactivityName: 1,
            unit: 1,
            quarter: { $ifNull: ["$quarter", "Q1"] }, // Default to Q1 if quarter is missing
            quantity: { $ifNull: [{ $toDouble: { $ifNull: ["$quantity", "0"] } }, 0] },
            totalCost: { $ifNull: [{ $toDouble: { $ifNull: ["$totalCost", "0"] } }, 0] },
            LHWRF: { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.LHWRF", "0"] } }, 0] },
            CC: { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.CC", "0"] } }, 0] },
            grant: { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.grant", "0"] } }, 0] },
            convergence: { $ifNull: [{ $toDouble: { $ifNull: ["$convergence", "0"] } }, 0] },
            noOfHouseholds: { $ifNull: [{ $toInt: { $ifNull: ["$noOfHouseholds", "0"] } }, 0] },
            noOfBeneficiaries: { $ifNull: [{ $toInt: { $ifNull: ["$noOfBeneficiaries", "0"] } }, 0] },
            center_id: 1,
            program_id: 1,
            project_id: 1,
            activityName_id: 1,
            subactivityName_id: 1,
          },
        },
        {
          $facet: {
            expandedPlans: [
              {
                $project: {
                  centerName: 1,
                  program: 1,
                  project: 1,
                  activityName: 1,
                  subactivityName: 1,
                  unit: 1,
                  center_id: 1,
                  program_id: 1,
                  project_id: 1,
                  activityName_id: 1,
                  subactivityName_id: 1,
                  quarters: {
                    $map: {
                      input: ["Q1", "Q2", "Q3", "Q4"],
                      as: "q",
                      in: {
                        quarter: "$$q",
                        quantity: { $cond: [{ $eq: ["$quarter", "$$q"] }, "$quantity", 0] },
                        totalCost: { $cond: [{ $eq: ["$quarter", "$$q"] }, "$totalCost", 0] },
                        LHWRF: { $cond: [{ $eq: ["$quarter", "$$q"] }, "$LHWRF", 0] },
                        CC: { $cond: [{ $eq: ["$quarter", "$$q"] }, "$CC", 0] },
                        grant: { $cond: [{ $eq: ["$quarter", "$$q"] }, "$grant", 0] },
                        convergence: { $cond: [{ $eq: ["$quarter", "$$q"] }, "$convergence", 0] },
                        noOfHouseholds: { $cond: [{ $eq: ["$quarter", "$$q"] }, "$noOfHouseholds", 0] },
                        noOfBeneficiaries: { $cond: [{ $eq: ["$quarter", "$$q"] }, "$noOfBeneficiaries", 0] }
                      }
                    }
                  }
                }
              },
              {
                $unwind: "$quarters"
              },
              {
                $replaceRoot: { newRoot: { $mergeObjects: ["$$ROOT", "$quarters"] } }
              },
              {
                $project: {
                  centerName: 1,
                  program: 1,
                  project: 1,
                  activityName: 1,
                  subactivityName: 1,
                  unit: 1,
                  quarter: 1,
                  quantity: 1,
                  totalCost: 1,
                  LHWRF: 1,
                  CC: 1,
                  grant: 1,
                  convergence: 1,
                  noOfHouseholds: 1,
                  noOfBeneficiaries: 1,
                  center_id: 1,
                  program_id: 1,
                  project_id: 1,
                  activityName_id: 1,
                  subactivityName_id: 1
                }
              }
            ]
          }
        },
        {
          $unwind: "$expandedPlans"
        },
        {
          $replaceRoot: { newRoot: "$expandedPlans" }
        },
        {
          $lookup: {
            from: "utilizationdetails",
            let: {
              center_id: "$center_id",
              program_id: "$program_id",
              project_id: "$project_id",
              activityName_id: "$activityName_id",
              subactivityName_id: "$subactivityName_id",
              centerName: "$centerName",
              program: "$program",
              project: "$project",
              activityName: "$activityName",
              subactivityName: "$subactivityName",
              utilStartDate: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$quarter", "Q1"] }, then: quarterDates.Q1.startDate },
                    { case: { $eq: ["$quarter", "Q2"] }, then: quarterDates.Q2.startDate },
                    { case: { $eq: ["$quarter", "Q3"] }, then: quarterDates.Q3.startDate },
                    { case: { $eq: ["$quarter", "Q4"] }, then: quarterDates.Q4.startDate },
                  ],
                  default: startDate
                }
              },
              utilEndDate: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$quarter", "Q1"] }, then: quarterDates.Q1.endDate },
                    { case: { $eq: ["$quarter", "Q2"] }, then: quarterDates.Q2.endDate },
                    { case: { $eq: ["$quarter", "Q3"] }, then: quarterDates.Q3.endDate },
                    { case: { $eq: ["$quarter", "Q4"] }, then: quarterDates.Q4.endDate },
                  ],
                  default: endDate
                }
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$center_id", "$$center_id"] },
                      { $eq: ["$program_id", "$$program_id"] },
                      { $eq: ["$project_id", "$$project_id"] },
                      { $eq: ["$activityName_id", "$$activityName_id"] },
                      { $eq: ["$subactivityName_id", "$$subactivityName_id"] },

                      { $eq: ["$centerName", "$$centerName"] },
                      { $eq: ["$program", "$$program"] },
                      { $eq: ["$project", "$$project"] },
                      { $eq: ["$activityName", "$$activityName"] },
                      { $eq: ["$subactivityName", "$$subactivityName"] },
                      { $gte: ["$voucherDate", "$$utilStartDate"] },
                      { $lte: ["$voucherDate", "$$utilEndDate"] },
                    ].filter(Boolean),
                  },
                },
              },
              {
                $project: {
                  quantity: { $ifNull: [{ $toDouble: { $ifNull: ["$quantity", "0"] } }, 0] },
                  totalCost: { $ifNull: [{ $toDouble: { $ifNull: ["$totalCost", "0"] } }, 0] },
                  LHWRF: { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.LHWRF", "0"] } }, 0] },
                  grant: { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.grant", "0"] } }, 0] },
                  CC: { $ifNull: [{ $toDouble: { $ifNull: ["$sourceofFund.CC", "0"] } }, 0] },
                  convergence: { $ifNull: [{ $toDouble: { $ifNull: ["$convergence", "0"] } }, 0] },
                  noOfHouseholds: { $ifNull: [{ $toInt: { $ifNull: ["$noOfHouseholds", "0"] } }, 0] },
                  noOfBeneficiaries: { $ifNull: [{ $toInt: { $ifNull: ["$noOfBeneficiaries", "0"] } }, 0] },
                  voucherDate: 1,
                },
              },
              {
                $group: {
                  _id: null,
                  quantity: { $sum: "$quantity" },
                  totalUtilizedAmount: { $sum: "$totalCost" },
                  utilized_LHWRF: { $sum: "$LHWRF" },
                  utilized_Grant: { $sum: "$grant" },
                  utilized_CC: { $sum: "$CC" },
                  utilized_Convergence: { $sum: "$convergence" },
                  noOfHouseholds: { $sum: "$noOfHouseholds" },
                  noOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
                },
              },
              {
                $project: {
                  _id: 0,
                  quantity: 1,
                  totalUtilizedAmount: 1,
                  utilized_LHWRF: 1,
                  utilized_Grant: 1,
                  utilized_CC: 1,
                  utilized_Convergence: 1,
                  noOfHouseholds: 1,
                  noOfBeneficiaries: 1,
                },
              },
            ],
            as: "utilizationData",
          },
        },
        {
          $unwind: { path: "$utilizationData", preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: {
              centerName: "$centerName",
              program: "$program",
              project: "$project",
              activityName: "$activityName",
              subactivityName: "$subactivityName",
              plannedUnit: "$unit",
              plannedQuarter: "$quarter", // Use AnnualPlan's quarter for planned values
            },
            plannedQuantity: { $sum: "$quantity" },
            plannedAmount: { $sum: "$totalCost" },
            plannedLHWRF: { $sum: "$LHWRF" },
            plannedCC: { $sum: "$CC" },
            plannedExtGrant: { $sum: "$grant" },
            plannedConvergence: { $sum: "$convergence" },
            plannedNoOfHouseholds: { $sum: "$noOfHouseholds" },
            plannedNoOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
            totalUtilisedQuantity: { $sum: { $ifNull: ["$utilizationData.quantity", 0] } },
            totalUtilisedAmount: { $sum: { $ifNull: ["$utilizationData.totalUtilizedAmount", 0] } },
            totalUtilisedLHWRF: { $sum: { $ifNull: ["$utilizationData.utilized_LHWRF", 0] } },
            totalUtilisedCC: { $sum: { $ifNull: ["$utilizationData.utilized_Grant", 0] } },
            totalUtilisedExtGrant: { $sum: { $ifNull: ["$utilizationData.utilized_CC", 0] } },
            totalUtilisedConvergence: { $sum: { $ifNull: ["$utilizationData.utilized_Convergence", 0] } },
            totalNoOfHouseholds: { $sum: { $ifNull: ["$utilizationData.noOfHouseholds", 0] } },
            totalNoOfBeneficiaries: { $sum: { $ifNull: ["$utilizationData.noOfBeneficiaries", 0] } },
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
            plannedUnit: "$_id.plannedUnit",
            quarter: "$_id.plannedQuarter", // Use planned quarter for the output
            plannedQuantity: { $ifNull: ["$plannedQuantity", 0] },
            plannedAmount: { $ifNull: ["$plannedAmount", 0] },
            plannedLHWRF: { $ifNull: ["$plannedLHWRF", 0] },
            plannedCC: { $ifNull: ["$plannedCC", 0] },
            plannedExtGrant: { $ifNull: ["$plannedExtGrant", 0] },
            plannedConvergence: { $ifNull: ["$plannedConvergence", 0] },
            plannedNoOfHouseholds: { $ifNull: ["$plannedNoOfHouseholds", 0] },
            plannedNoOfBeneficiaries: { $ifNull: ["$plannedNoOfBeneficiaries", 0] },
            totalUtilisedQuantity: { $ifNull: ["$totalUtilisedQuantity", 0] },
            totalUtilisedAmount: { $ifNull: ["$totalUtilisedAmount", 0] },
            totalUtilisedLHWRF: { $ifNull: ["$totalUtilisedLHWRF", 0] },
            totalUtilisedCC: { $ifNull: ["$totalUtilisedCC", 0] },
            totalUtilisedExtGrant: { $ifNull: ["$totalUtilisedExtGrant", 0] },
            totalUtilisedConvergence: { $ifNull: ["$totalUtilisedConvergence", 0] },
            totalNoOfHouseholds: { $ifNull: ["$totalNoOfHouseholds", 0] },
            totalNoOfBeneficiaries: { $ifNull: ["$totalNoOfBeneficiaries", 0] },
          },
        },
        {
          $addFields: {
            quarterOrder: {
              $toInt: {
                $cond: [
                  { $regexMatch: { input: "$quarter", regex: /^Q[1-4]$/ } },
                  { $substr: ["$quarter", 1, -1] },
                  "1" // Default to 1 (Q1) if quarter is invalid
                ]
              }
            },
          },
        },
        {
          $addFields: {
            percentageUtilizedAgainstPlan: {
              $cond: [
                { $gt: [{ $ifNull: ["$plannedAmount", 0] }, 0] },
                { $round: [{ $multiply: [{ $divide: [{ $ifNull: ["$totalUtilisedAmount", 0] }, { $ifNull: ["$plannedAmount", 0] }] }, 100] }, 2] },
                0
              ],
            },
            balanceAmount: { $subtract: ["$plannedAmount", { $ifNull: ["$totalUtilisedAmount", 0] }] },
          },
        },
        { $facet: { totalRecords: [{ $count: "count" }], paginatedData: paginatedDataStages } },
        {
          $project: {
            totalRecords: { $ifNull: [{ $arrayElemAt: ["$totalRecords.count", 0] }, 0] },
            paginatedData: 1,
          },
        },
      ]).then((result) => {
        // console.log("Aggregation Result:", JSON.stringify(result, null, 2)); // Debug log
        resolve(result);
      }).catch(reject);
    });
  }
  exports.plan_vs_utilization_report1 = async (req, res, next) => {
    try {
      let recsPerPage = req.body.recsPerPage || 10;
      let pageNum = req.body.pageNumber || 1;
      let skipRec = recsPerPage * (pageNum - 1);
      let query = {};

      // console.log("req.body", JSON.stringify(req.body, null, 2));

      if (req.body.year !== "all") query.year = req.body.year;
      if (req.body.center_ID !== "all") query.center_id = new ObjectId(req.body.center_ID);
      if (req.body.program_id !== "all") query.program_id = new ObjectId(req.body.program_id);
      if (req.body.project_id !== "all") query.project_id = new ObjectId(req.body.project_id);
      if (req.body.activityName_id !== "all") query.activityName_id = new ObjectId(req.body.activityName_id);
      if (req.body.subactivityName_id !== "all") query.subactivityName_id = new ObjectId(req.body.subactivityName_id);

      if (req.body.searchText !== "-") {
        const searchRegex = new RegExp(req.body.searchText, "i");
        query.$or = [
          { centerName: searchRegex },
          { program: searchRegex },
          { project: searchRegex },
          { activityName: searchRegex },
          { subactivityName: searchRegex },
          { unit: searchRegex },
        ];
      }
      // console.log("query", JSON.stringify(query, null, 2));

      let utilStartDate = req.body.fromDate;
      let utilEndDate = req.body.toDate;
      // console.log("utilStartDate", utilStartDate);
      // console.log("utilEndDate", utilEndDate);

      let paginatedDataStages = [{ $sort: { center_id: 1, program_id: 1, project_id: 1, activityName_id: 1, subactivityName_id: 1, quarterOrder: 1 } }];
      if (!req.body.removePagination) {
        paginatedDataStages.push({ $skip: parseInt(skipRec) }, { $limit: parseInt(recsPerPage) });
      }

      let allRecs = [];
      let totalPlannedQuantity = 0;
      let totalPlannedAmount = 0;
      let totalPlannedLHWRF = 0;
      let totalPlannedCC = 0;
      let totalPlannedExtGrant = 0;
      let totalPlannedConvergence = 0;
      let totalPlannedNoOfHouseholds = 0;
      let totalPlannedNoOfBeneficiaries = 0;
      let totalUtilisedQuantity = 0;
      let totalUtilisedAmount = 0;
      let totalUtilisedLHWRF = 0;
      let totalUtilisedCC = 0;
      let totalUtilisedExtGrant = 0;
      let totalUtilisedConvergence = 0;
      let totalNoOfHouseholds = 0;
      let totalNoOfBeneficiaries = 0;

      const quarterDates = getQuarterDates(req.body.year);
      const currentQuarter = req.body.quarter || "Q1";

      if (req.body.quarter === "all") {

        // const quarterPromises = Object.keys(quarterDates).map(async (quarter) => {
          // console.log("Processing quarter:", quarter); // Debug log
        //   const { startDate, endDate } = quarterDates[quarter];
        //   const response = await plan_vs_utilizationAggregateData(query, quarter, startDate, endDate, paginatedDataStages);
        //   return response[0]?.paginatedData || [];
        // });
        // const responses = await Promise.all(quarterPromises);
        // allRecs = responses.flat();
        const response = await plan_vs_utilizationAggregateData(query, "all", utilStartDate, utilStartDate, paginatedDataStages);
        allRecs = response[0]?.paginatedData || [];

        const groupedByCombo = allRecs.reduce((acc, rec) => {
          const key = `${rec.centerName}|${rec.program}|${rec.project}|${rec.activityName}|${rec.subactivityName}|${rec.plannedUnit}`;
          if (!acc[key]) acc[key] = {};
          acc[key][rec.quarter] = rec;
          return acc;
        }, {});

        allRecs = [];
        for (const comboKey in groupedByCombo) {
          const comboData = groupedByCombo[comboKey];
          Object.keys(quarterDates).forEach((quarter) => {
            const { startDate, endDate } = quarterDates[quarter];
            const rec = comboData[quarter] || {
              centerName: comboKey.split('|')[0] || "-",
              program: comboKey.split('|')[1] || "-",
              project: comboKey.split('|')[2] || "-",
              activityName: comboKey.split('|')[3] || "-",
              subactivityName: comboKey.split('|')[4] || "-",
              plannedUnit: comboKey.split('|')[5] || "-",
              quarter,
              plannedQuantity: 0,
              plannedAmount: 0,
              plannedLHWRF: 0,
              plannedCC: 0,
              plannedExtGrant: 0,
              plannedConvergence: 0,
              plannedNoOfHouseholds: 0,
              plannedNoOfBeneficiaries: 0,
              totalUtilisedQuantity: 0,
              totalUtilisedAmount: 0,
              totalUtilisedLHWRF: 0,
              totalUtilisedCC: 0,
              totalUtilisedExtGrant: 0,
              totalUtilisedConvergence: 0,
              totalNoOfHouseholds: 0,
              totalNoOfBeneficiaries: 0,
              percentageUtilizedAgainstPlan: 0,
              balanceAmount: 0,
              quarterOrder: parseInt(quarter.replace('Q', '')),
            };

            const utilMatch = allRecs.find(r => r.centerName === rec.centerName && r.quarter === quarter);
            if (utilMatch) {
              rec.totalUtilisedQuantity = utilMatch.totalUtilisedQuantity;
              rec.totalUtilisedAmount = utilMatch.totalUtilisedAmount;
              rec.totalUtilisedLHWRF = utilMatch.totalUtilisedLHWRF;
              rec.totalUtilisedCC = utilMatch.totalUtilisedCC;
              rec.totalUtilisedExtGrant = utilMatch.totalUtilisedExtGrant;
              rec.totalUtilisedConvergence = utilMatch.totalUtilisedConvergence;
              rec.totalNoOfHouseholds = utilMatch.totalNoOfHouseholds;
              rec.totalNoOfBeneficiaries = utilMatch.totalNoOfBeneficiaries;
            }

            allRecs.push(rec);
          });
        }
      } else {
        const { startDate, endDate } = utilStartDate && utilEndDate ? { startDate: utilStartDate, endDate: utilEndDate } : quarterDates[currentQuarter];
        const response = await plan_vs_utilizationAggregateData(query, currentQuarter, startDate, endDate, paginatedDataStages);
        // console.log("response", JSON.stringify(response, null, 2)); // Debug log
        allRecs = response[0]?.paginatedData || [];
      }

      if (allRecs.length > 0) {
        allRecs.forEach((doc) => {
          totalPlannedQuantity += doc.plannedQuantity || 0;
          totalPlannedAmount += doc.plannedAmount || 0;
          totalPlannedLHWRF += doc.plannedLHWRF || 0;
          totalPlannedCC += doc.plannedCC || 0;
          totalPlannedExtGrant += doc.plannedExtGrant || 0;
          totalPlannedConvergence += doc.plannedConvergence || 0;
          totalPlannedNoOfHouseholds += doc.plannedNoOfHouseholds || 0;
          totalPlannedNoOfBeneficiaries += doc.plannedNoOfBeneficiaries || 0;
          totalUtilisedQuantity += doc.totalUtilisedQuantity || 0;
          totalUtilisedAmount += doc.totalUtilisedAmount || 0;
          totalUtilisedLHWRF += doc.totalUtilisedLHWRF || 0;
          totalUtilisedCC += doc.totalUtilisedCC || 0;
          totalUtilisedExtGrant += doc.totalUtilisedExtGrant || 0;
          totalUtilisedConvergence += doc.totalUtilisedConvergence || 0;
          totalNoOfHouseholds += doc.totalNoOfHouseholds || 0;
          totalNoOfBeneficiaries += doc.totalNoOfBeneficiaries || 0;
        });
      }

      const processedData = allRecs.map((doc) => ({
        centerName: doc.centerName || "-",
        program: doc.program || "-",
        project: doc.project || "-",
        activityName: doc.activityName || "-",
        subactivityName: doc.subactivityName || "-",
        plannedUnit: doc.plannedUnit || "-",
        quarter: doc.quarter || "-",
        plannedQuantity: doc.plannedQuantity || 0,
        plannedAmount: doc.plannedAmount || 0,
        plannedLHWRF: doc.plannedLHWRF || 0,
        plannedCC: doc.plannedCC || 0,
        plannedExtGrant: doc.plannedExtGrant || 0,
        plannedConvergence: doc.plannedConvergence || 0,
        plannedNoOfHouseholds: doc.plannedNoOfHouseholds || 0,
        plannedNoOfBeneficiaries: doc.plannedNoOfBeneficiaries || 0,
        totalUtilisedQuantity: doc.totalUtilisedQuantity || 0,
        totalUtilisedAmount: doc.totalUtilisedAmount || 0,
        totalUtilisedLHWRF: doc.totalUtilisedLHWRF || 0,
        totalUtilisedCC: doc.totalUtilisedCC || 0,
        totalUtilisedExtGrant: doc.totalUtilisedExtGrant || 0,
        totalUtilisedConvergence: doc.totalUtilisedConvergence || 0,
        totalNoOfHouseholds: doc.totalNoOfHouseholds || 0,
        totalNoOfBeneficiaries: doc.totalNoOfBeneficiaries || 0,
        percentageUtilizedAgainstPlan: doc.percentageUtilizedAgainstPlan || 0,
        balanceAmount: doc.balanceAmount || 0,
      }));

      if (allRecs.length > 0) {
        processedData.push({
          centerName: "Total",
          program: "-",
          project: "-",
          activityName: "-",
          subactivityName: "-",
          plannedUnit: "-",
          quarter: "-",
          plannedQuantity: totalPlannedQuantity,
          plannedAmount: totalPlannedAmount,
          plannedLHWRF: totalPlannedLHWRF,
          plannedCC: totalPlannedCC,
          plannedExtGrant: totalPlannedExtGrant,
          plannedConvergence: totalPlannedConvergence,
          plannedNoOfHouseholds: totalPlannedNoOfHouseholds,
          plannedNoOfBeneficiaries: totalPlannedNoOfBeneficiaries,
          totalUtilisedQuantity: totalUtilisedQuantity,
          totalUtilisedAmount: totalUtilisedAmount,
          totalUtilisedLHWRF: totalUtilisedLHWRF,
          totalUtilisedCC: totalUtilisedCC,
          totalUtilisedExtGrant: totalUtilisedExtGrant,
          totalUtilisedConvergence: totalUtilisedConvergence,
          totalNoOfHouseholds: totalNoOfHouseholds,
          totalNoOfBeneficiaries: totalNoOfBeneficiaries,
          percentageUtilizedAgainstPlan: totalPlannedAmount > 0 ? Math.round((totalUtilisedAmount / totalPlannedAmount) * 100 * 100) / 100 : 0,
          balanceAmount: totalPlannedAmount - totalUtilisedAmount,
        });
      }

      res.status(200).json({
        totalRecs: allRecs.length,
        tableData: processedData,
        success: true,
      });
    } catch (error) {
      // console.log("Error in plan vs utilisation => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    }
  };

  exports.plan_vs_utilization_report = (req, res, next) => {
    let recsPerPage = parseInt(req.body.recsPerPage) || 10;
    let pageNum = parseInt(req.body.pageNumber) || 1;
    let skipRec = recsPerPage * (pageNum - 1);
    let query = {};
    // console.log("req.body", req.body);

    if (req.body.year !== "all") query.year = req.body.year;
    if (req.body.quarter !== "all") query.quarter = req.body.quarter;
    if (req.body.center_ID !== "all") query.center_id = new ObjectId(req.body.center_ID);
    if (req.body.program_id !== "all") query.program_id = new ObjectId(req.body.program_id);
    if (req.body.project_id !== "all") query.project_id = new ObjectId(req.body.project_id);
    if (req.body.activityName_id !== "all") query.activityName_id = new ObjectId(req.body.activityName_id);
    if (req.body.subactivityName_id !== "all") query.subactivityName_id = new ObjectId(req.body.subactivityName_id);

    let utilStartDate = req.body.fromDate || "2025-04-01"; // Default to year start if not provided
    let utilEndDate = req.body.toDate || "2026-03-31"; // Default to year end if not provided
    // console.log("utilStartDate", utilStartDate);
    // console.log("utilEndDate", utilEndDate);

    if (req.body.searchText !== "-") {
      const searchRegex = new RegExp(req.body.searchText, "i");
      query.$or = [
        { centerName: searchRegex },
        { program: searchRegex },
        { project: searchRegex },
        { activityName: searchRegex },
        { subactivityName: searchRegex },
        { unit: searchRegex },
      ];
    }
    // console.log("query", JSON.stringify(query, null, 2));

    let paginatedDataStages = [{
      $sort: {
        center_id: 1,
        program_id: 1,
        project_id: 1,
        activityName_id: 1,
        subactivityName_id: 1,
        quarterOrder: 1
      }
    }];
    if (!req.body.removePagination) {
      paginatedDataStages.push({ $skip: skipRec }, { $limit: recsPerPage });
    }

    AnnualPlan.aggregate([
      { $match: query },
      {
        $project: {
          centerName: { $ifNull: ["$centerName", "-"] },
          program: { $ifNull: ["$program", "-"] },
          project: { $ifNull: ["$project", "-"] },
          activityName: { $ifNull: ["$activityName", "-"] },
          subactivityName: { $ifNull: ["$subactivityName", "-"] },
          unit: { $ifNull: ["$unit", "N/A"] },
          quarter: { $ifNull: ["$quarter", "Q1"] },
          quantity: { $toDouble: { $ifNull: ["$quantity", 0] } },
          totalCost: { $toDouble: { $ifNull: ["$totalCost", 0] } },
          LHWRF: { $toDouble: { $ifNull: ["$sourceofFund.LHWRF", 0] } },
          CC: { $toDouble: { $ifNull: ["$sourceofFund.CC", 0] } },
          grant: { $toDouble: { $ifNull: ["$sourceofFund.grant", 0] } },
          convergence: { $toDouble: { $ifNull: ["$convergence", 0] } },
          noOfHouseholds: { $toInt: { $ifNull: ["$noOfHouseholds", 0] } },
          noOfBeneficiaries: { $toInt: { $ifNull: ["$noOfBeneficiaries", 0] } },
          center_id: 1,
          program_id: 1,
          project_id: 1,
          activityName_id: 1,
          subactivityName_id: 1,
        },
      },
      {
        $set: {
          quarters: {
            $cond: {
              if: { $eq: [req.body.quarter, "all"] },
              then: [
                { quarter: "Q1", startDate: "2025-04-01", endDate: "2025-06-30" },
                { quarter: "Q2", startDate: "2025-07-01", endDate: "2025-09-30" },
                { quarter: "Q3", startDate: "2025-10-01", endDate: "2025-12-31" },
                { quarter: "Q4", startDate: "2026-01-01", endDate: "2026-03-31" },
              ],
              else: [{ quarter: "$quarter", startDate: utilStartDate, endDate: utilEndDate }],
            },
          },
        },
      },
      { $unwind: "$quarters" },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                centerName: "$centerName",
                program: "$program",
                project: "$project",
                activityName: "$activityName",
                subactivityName: "$subactivityName",
                plannedUnit: "$unit",
                center_id: "$center_id",
                program_id: "$program_id",
                project_id: "$project_id",
                activityName_id: "$activityName_id",
                subactivityName_id: "$subactivityName_id",
              },
              {
                quarter: "$quarters.quarter",
                plannedQuantity: { $cond: [{ $eq: ["$quarter", "$quarters.quarter"] }, "$quantity", 0] },
                plannedAmount: { $cond: [{ $eq: ["$quarter", "$quarters.quarter"] }, "$totalCost", 0] },
                plannedLHWRF: { $cond: [{ $eq: ["$quarter", "$quarters.quarter"] }, "$LHWRF", 0] },
                plannedCC: { $cond: [{ $eq: ["$quarter", "$quarters.quarter"] }, "$CC", 0] },
                plannedExtGrant: { $cond: [{ $eq: ["$quarter", "$quarters.quarter"] }, "$grant", 0] },
                plannedConvergence: { $cond: [{ $eq: ["$quarter", "$quarters.quarter"] }, "$convergence", 0] },
                plannedNoOfHouseholds: { $cond: [{ $eq: ["$quarter", "$quarters.quarter"] }, "$noOfHouseholds", 0] },
                plannedNoOfBeneficiaries: { $cond: [{ $eq: ["$quarter", "$quarters.quarter"] }, "$noOfBeneficiaries", 0] },
                startDate: "$quarters.startDate",
                endDate: "$quarters.endDate",
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "utilizationdetails",
          let: {
            center_id: "$center_id",
            program_id: "$program_id",
            project_id: "$project_id",
            activityName_id: "$activityName_id",
            subactivityName_id: "$subactivityName_id",
            startDate: "$startDate",
            endDate: "$endDate",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$center_id", "$$center_id"] },
                    { $eq: ["$program_id", "$$program_id"] },
                    { $eq: ["$project_id", "$$project_id"] },
                    { $eq: ["$activityName_id", "$$activityName_id"] },
                    { $eq: ["$subactivityName_id", "$$subactivityName_id"] },
                    { $gte: ["$voucherDate", "$$startDate"] },
                    { $lte: ["$voucherDate", "$$endDate"] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                quantity: { $sum: { $toDouble: { $ifNull: ["$quantity", 0] } } },
                totalUtilizedAmount: { $sum: { $toDouble: { $ifNull: ["$totalCost", 0] } } },
                utilized_LHWRF: { $sum: { $toDouble: { $ifNull: ["$sourceofFund.LHWRF", 0] } } },
                utilized_Grant: { $sum: { $toDouble: { $ifNull: ["$sourceofFund.grant", 0] } } },
                utilized_CC: { $sum: { $toDouble: { $ifNull: ["$sourceofFund.CC", 0] } } },
                utilized_Convergence: { $sum: { $toDouble: { $ifNull: ["$convergence", 0] } } },
                noOfHouseholds: { $sum: { $toInt: { $ifNull: ["$noOfHouseholds", 0] } } },
                noOfBeneficiaries: { $sum: { $toInt: { $ifNull: ["$noOfBeneficiaries", 0] } } },
              },
            },
            {
              $project: { _id: 0 },
            },
          ],
          as: "utilizationData",
        },
      },
      {
        $addFields: {
          utilization: {
            $ifNull: [{ $arrayElemAt: ["$utilizationData", 0] }, {
              quantity: 0,
              totalUtilizedAmount: 0,
              utilized_LHWRF: 0,
              utilized_Grant: 0,
              utilized_CC: 0,
              utilized_Convergence: 0,
              noOfHouseholds: 0,
              noOfBeneficiaries: 0,
            }],
          },
        },
      },
      {
        $project: {
          centerName: 1,
          program: 1,
          project: 1,
          activityName: 1,
          subactivityName: 1,
          plannedUnit: 1,
          quarter: 1,
          plannedQuantity: 1,
          plannedAmount: 1,
          plannedLHWRF: 1,
          plannedCC: 1,
          plannedExtGrant: 1,
          plannedConvergence: 1,
          plannedNoOfHouseholds: 1,
          plannedNoOfBeneficiaries: 1,
          totalUtilisedQuantity: "$utilization.quantity",
          totalUtilisedAmount: "$utilization.totalUtilizedAmount",
          totalUtilisedLHWRF: "$utilization.utilized_LHWRF",
          totalUtilisedCC: "$utilization.utilized_CC",
          totalUtilisedExtGrant: "$utilization.utilized_Grant",
          totalUtilisedConvergence: "$utilization.utilized_Convergence",
          totalNoOfHouseholds: "$utilization.noOfHouseholds",
          totalNoOfBeneficiaries: "$utilization.noOfBeneficiaries",
        },
      },
      {
        $addFields: {
          percentageUtilizedAgainstPlan: {
            $cond: [
              { $gt: ["$plannedAmount", 0] },
              { $round: [{ $multiply: [{ $divide: ["$totalUtilisedAmount", "$plannedAmount"] }, 100] }, 2] },
              0,
            ],
          },
          balanceAmount: { $subtract: ["$plannedAmount", "$totalUtilisedAmount"] },
        },
      },
      {
        $addFields: {
          quarterOrder: {
            $toInt: { $substr: ["$quarter", 1, -1] },
          },
        },
      },
      {
        $facet: {
          totalRecords: [{ $count: "count" }],
          paginatedData: paginatedDataStages,
        },
      },
      {
        $project: {
          totalRecords: { $ifNull: [{ $arrayElemAt: ["$totalRecords.count", 0] }, 0] },
          paginatedData: 1,
        },
      },
    ])
      .then((response) => {
        // console.log("response", response);
        let totals = {
          plannedQuantity: 0, plannedAmount: 0, plannedLHWRF: 0, plannedCC: 0, plannedExtGrant: 0, plannedConvergence: 0,
          plannedNoOfHouseholds: 0, plannedNoOfBeneficiaries: 0, totalUtilisedQuantity: 0, totalUtilisedAmount: 0,
          totalUtilisedLHWRF: 0, totalUtilisedCC: 0, totalUtilisedExtGrant: 0, totalUtilisedConvergence: 0,
          totalNoOfHouseholds: 0, totalNoOfBeneficiaries: 0, balanceAmount: 0,
        };
        const data = response[0].paginatedData.map((doc) => {
          Object.keys(totals).forEach(key => totals[key] += doc[key] || 0);
          return {
            centerName: doc.centerName,
            program: doc.program,
            project: doc.project,
            activityName: doc.activityName,
            subactivityName: doc.subactivityName,
            plannedUnit: doc.plannedUnit,
            quarter: doc.quarter,
            plannedQuantity: doc.plannedQuantity,
            plannedAmount: doc.plannedAmount,
            plannedLHWRF: doc.plannedLHWRF,
            plannedCC: doc.plannedCC,
            plannedExtGrant: doc.plannedExtGrant,
            plannedConvergence: doc.plannedConvergence,
            plannedNoOfHouseholds: doc.plannedNoOfHouseholds,
            plannedNoOfBeneficiaries: doc.plannedNoOfBeneficiaries,
            totalUtilisedQuantity: doc.totalUtilisedQuantity,
            totalUtilisedAmount: doc.totalUtilisedAmount,
            totalUtilisedLHWRF: doc.totalUtilisedLHWRF,
            totalUtilisedCC: doc.totalUtilisedCC,
            totalUtilisedExtGrant: doc.totalUtilisedExtGrant,
            totalUtilisedConvergence: doc.totalUtilisedConvergence,
            totalNoOfHouseholds: doc.totalNoOfHouseholds,
            totalNoOfBeneficiaries: doc.totalNoOfBeneficiaries,
            percentageUtilizedAgainstPlan: doc.percentageUtilizedAgainstPlan,
            balanceAmount: doc.balanceAmount,
          };
        });

        if (data.length > 0) {
          const totalPercentage = totals.plannedAmount > 0 ? Math.round((totals.totalUtilisedAmount / totals.plannedAmount) * 10000) / 100 : 0;
          totals.balanceAmount = totals.plannedAmount - totals.totalUtilisedAmount;
          data.push({
            centerName: "Total",
            program: "-",
            project: "-",
            activityName: "-",
            subactivityName: "-",
            plannedUnit: "-",
            quarter: "-",
            ...totals,
            percentageUtilizedAgainstPlan: totalPercentage,
          });
        }

        res.status(200).json({
          totalRecs: response[0].totalRecords,
          tableData: data,
          success: true,
        });
      })
      .catch((error) => {
        // console.log("Error in plan vs utilisation => ", error);
        res.status(500).json({ errorMsg: error.message, success: false });
      });
  };
  async function plan_vs_utilizationAggregateDataL(query, quarter, startDate, endDate, paginatedDataStages) {
    return new Promise((resolve, reject) => {
      // console.log("query 2", JSON.stringify(query, null, 2));
      // console.log("quarter, startDate, endDate, paginatedDataStages", quarter, startDate, endDate, paginatedDataStages);
      AnnualPlan.aggregate([
        // { $match: { ...query, quarter } },
        { $match: quarter === "all" ? query : { ...query, quarter } },
        {
          $lookup: {
            from: "utilizationdetails",
            let: {
              center_id: "$center_id",
              program_id: "$program_id",
              project_id: "$project_id",
              activityName_id: "$activityName_id",
              subactivityName_id: "$subactivityName_id",
              utilStartDate: startDate,
              utilEndDate: endDate,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$center_id", "$$center_id"] },
                      { $eq: ["$program_id", "$$program_id"] },
                      { $eq: ["$project_id", "$$project_id"] },
                      { $eq: ["$activityName_id", "$$activityName_id"] },
                      { $eq: ["$subactivityName_id", "$$subactivityName_id"] },
                      { $gte: ["$voucherDate", "$$utilStartDate"] },
                      { $lte: ["$voucherDate", "$$utilEndDate"] },
                    ].filter(Boolean),
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  quantity: { $sum: { $ifNull: ["$quantity", 0] } },
                  totalUtilizedAmount: { $sum: { $ifNull: ["$totalCost", 0] } },
                  utilized_LHWRF: { $sum: { $ifNull: ["$sourceofFund.LHWRF", 0] } },
                  utilized_Grant: { $sum: { $ifNull: ["$sourceofFund.grant", 0] } },
                  utilized_CC: { $sum: { $ifNull: ["$sourceofFund.CC", 0] } },
                  utilized_Convergence: { $sum: { $ifNull: ["$convergence", 0] } },
                  noOfHouseholds: { $sum: { $ifNull: ["$noOfHouseholds", 0] } },
                  noOfBeneficiaries: { $sum: { $ifNull: ["$noOfBeneficiaries", 0] } },
                },
              },
              {
                $project: {
                  quantity: { $ifNull: ["$quantity", 0] },
                  totalUtilizedAmount: { $ifNull: ["$totalUtilizedAmount", 0] },
                  utilized_LHWRF: { $ifNull: ["$utilized_LHWRF", 0] },
                  utilized_Grant: { $ifNull: ["$utilized_Grant", 0] },
                  utilized_CC: { $ifNull: ["$utilized_CC", 0] },
                  utilized_Convergence: { $ifNull: ["$utilized_Convergence", 0] },
                  noOfHouseholds: { $ifNull: ["$noOfHouseholds", 0] },
                  noOfBeneficiaries: { $ifNull: ["$noOfBeneficiaries", 0] },
                },
              },
            ],
            as: "utilizationData",
          },
        },
        {
          $addFields: {
            utilization: {
              $ifNull: [{ $arrayElemAt: ["$utilizationData", 0] }, {
                quantity: 0,
                totalUtilizedAmount: 0,
                utilized_LHWRF: 0,
                utilized_Grant: 0,
                utilized_CC: 0,
                utilized_Convergence: 0,
                noOfHouseholds: 0,
                noOfBeneficiaries: 0,
              }],
            },
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
              plannedUnit: "$unit",
              quarter: "$quarter",
              totalUtilisedQuantity: "$utilization.quantity",
              totalUtilisedAmount: "$utilization.totalUtilizedAmount",
              totalUtilisedLHWRF: "$utilization.utilized_LHWRF",
              totalUtilisedCC: "$utilization.utilized_Grant",
              totalUtilisedExtGrant: "$utilization.utilized_CC",
              totalUtilisedConvergence: "$utilization.utilized_Convergence",
              totalNoOfHouseholds: "$utilization.noOfHouseholds",
              totalNoOfBeneficiaries: "$utilization.noOfBeneficiaries",
            },
            plannedQuantity: { $sum: "$quantity" },
            plannedAmount: { $sum: "$totalCost" },
            plannedLHWRF: { $sum: "$sourceofFund.LHWRF" },
            plannedCC: { $sum: "$sourceofFund.CC" },
            plannedExtGrant: { $sum: "$sourceofFund.grant" },
            plannedConvergence: { $sum: "$convergence" },
            plannedNoOfHouseholds: { $sum: "$noOfHouseholds" },
            plannedNoOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
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
            plannedUnit: "$_id.plannedUnit",
            quarter: "$_id.quarter",
            plannedQuantity: 1,
            plannedAmount: 1,
            plannedLHWRF: 1,
            plannedCC: 1,
            plannedExtGrant: 1,
            plannedConvergence: 1,
            plannedNoOfHouseholds: 1,
            plannedNoOfBeneficiaries: 1,
            totalUtilisedQuantity: "$_id.totalUtilisedQuantity",
            totalUtilisedAmount: "$_id.totalUtilisedAmount",
            totalUtilisedLHWRF: "$_id.totalUtilisedLHWRF",
            totalUtilisedCC: "$_id.totalUtilisedCC",
            totalUtilisedExtGrant: "$_id.totalUtilisedExtGrant",
            totalUtilisedConvergence: "$_id.totalUtilisedConvergence",
            totalNoOfHouseholds: "$_id.totalNoOfHouseholds",
            totalNoOfBeneficiaries: "$_id.totalNoOfBeneficiaries",
          },
        },
        {
          $addFields: {
            quarterOrder: { $toInt: { $substr: ["$quarter", 1, -1] } },
          },
        },
        {
          $addFields: {
            percentageUtilizedAgainstPlan: {
              $cond: [
                { $gt: ["$plannedAmount", 0] },
                { $round: [{ $multiply: [{ $divide: ["$totalUtilisedAmount", "$plannedAmount"] }, 100] }, 2] },
                0,
              ],
            },
            balanceAmount: { $subtract: ["$plannedAmount", { $ifNull: ["$totalUtilisedAmount", 0] }] },
          },
        },
        { $facet: { totalRecords: [{ $count: "count" }], paginatedData: paginatedDataStages } },
        {
          $project: {
            totalRecords: { $ifNull: [{ $arrayElemAt: ["$totalRecords.count", 0] }, 0] },
            paginatedData: 1,
          },
        },
      ]).then(resolve).catch(reject);
    });
  }
  exports.plan_vs_utilization_reportL = async (req, res, next) => {
    try {
      let recsPerPage = req.body.recsPerPage || 10;
      let pageNum = req.body.pageNumber || 1;
      let skipRec = recsPerPage * (pageNum - 1);
      let query = {};

      // console.log("req.body", JSON.stringify(req.body, null, 2));

      if (req.body.year !== "all") query.year = req.body.year;
      if (req.body.center_ID !== "all") query.center_id = new ObjectId(req.body.center_ID);
      if (req.body.program_id !== "all") query.program_id = new ObjectId(req.body.program_id);
      if (req.body.project_id !== "all") query.project_id = new ObjectId(req.body.project_id);
      if (req.body.activityName_id !== "all") query.activityName_id = new ObjectId(req.body.activityName_id);
      if (req.body.subactivityName_id !== "all") query.subactivityName_id = new ObjectId(req.body.subactivityName_id);

      if (req.body.searchText !== "-") {
        const searchRegex = new RegExp(req.body.searchText, "i");
        query.$or = [
          { centerName: searchRegex },
          { program: searchRegex },
          { project: searchRegex },
          { activityName: searchRegex },
          { subactivityName: searchRegex },
          { unit: searchRegex },
        ];
      }
      // console.log("query", JSON.stringify(query, null, 2));

      let utilStartDate = req.body.fromDate;
      let utilEndDate = req.body.toDate;
      // console.log("utilStartDate", utilStartDate);
      // console.log("utilEndDate", utilEndDate);

      let paginatedDataStages = [{ $sort: { centerName: 1, program: 1, project: 1, activityName: 1, subactivityName: 1, quarterOrder: 1 } }];
      if (!req.body.removePagination) {
        paginatedDataStages.push({ $skip: parseInt(skipRec) }, { $limit: parseInt(recsPerPage) });
      }

      let allRecs = [];
      let totalPlannedQuantity = 0;
      let totalPlannedAmount = 0;
      let totalPlannedLHWRF = 0;
      let totalPlannedCC = 0;
      let totalPlannedExtGrant = 0;
      let totalPlannedConvergence = 0;
      let totalPlannedNoOfHouseholds = 0;
      let totalPlannedNoOfBeneficiaries = 0;
      let totalUtilisedQuantity = 0;
      let totalUtilisedAmount = 0;
      let totalUtilisedLHWRF = 0;
      let totalUtilisedCC = 0;
      let totalUtilisedExtGrant = 0;
      let totalUtilisedConvergence = 0;
      let totalNoOfHouseholds = 0;
      let totalNoOfBeneficiaries = 0;

      const quarterDates = getQuarterDates(req.body.year);
      const currentQuarter = req.body.quarter || "Q1";

      if (req.body.quarter === "all") {

        const quarterPromises = Object.keys(quarterDates).map(async (quarter) => {
          const { startDate, endDate } = quarterDates[quarter];
          const response = await plan_vs_utilizationAggregateData(query, quarter, startDate, endDate, paginatedDataStages);
          return response[0]?.paginatedData || [];
        });
        const responses = await Promise.all(quarterPromises);
        allRecs = responses.flat();
      } else {
        const { startDate, endDate } = utilStartDate && utilEndDate ? { startDate: utilStartDate, endDate: utilEndDate } : quarterDates[currentQuarter];
        const response = await plan_vs_utilizationAggregateData(query, currentQuarter, startDate, endDate, paginatedDataStages);
        allRecs = response[0]?.paginatedData || [];
      }

      if (allRecs.length > 0) {
        allRecs.forEach((doc) => {
          totalPlannedQuantity += doc.plannedQuantity || 0;
          totalPlannedAmount += doc.plannedAmount || 0;
          totalPlannedLHWRF += doc.plannedLHWRF || 0;
          totalPlannedCC += doc.plannedCC || 0;
          totalPlannedExtGrant += doc.plannedExtGrant || 0;
          totalPlannedConvergence += doc.plannedConvergence || 0;
          totalPlannedNoOfHouseholds += doc.plannedNoOfHouseholds || 0;
          totalPlannedNoOfBeneficiaries += doc.plannedNoOfBeneficiaries || 0;
          totalUtilisedQuantity += doc.totalUtilisedQuantity || 0;
          totalUtilisedAmount += doc.totalUtilisedAmount || 0;
          totalUtilisedLHWRF += doc.totalUtilisedLHWRF || 0;
          totalUtilisedCC += doc.totalUtilisedCC || 0;
          totalUtilisedExtGrant += doc.totalUtilisedExtGrant || 0;
          totalUtilisedConvergence += doc.totalUtilisedConvergence || 0;
          totalNoOfHouseholds += doc.totalNoOfHouseholds || 0;
          totalNoOfBeneficiaries += doc.totalNoOfBeneficiaries || 0;
        });
      }

      const processedData = allRecs.map((doc) => ({
        centerName: doc.centerName || "-",
        program: doc.program || "-",
        project: doc.project || "-",
        activityName: doc.activityName || "-",
        subactivityName: doc.subactivityName || "-",
        plannedUnit: doc.plannedUnit || "-",
        quarter: doc.quarter || "-",
        plannedQuantity: doc.plannedQuantity || 0,
        plannedAmount: doc.plannedAmount || 0,
        plannedLHWRF: doc.plannedLHWRF || 0,
        plannedCC: doc.plannedCC || 0,
        plannedExtGrant: doc.plannedExtGrant || 0,
        plannedConvergence: doc.plannedConvergence || 0,
        plannedNoOfHouseholds: doc.plannedNoOfHouseholds || 0,
        plannedNoOfBeneficiaries: doc.plannedNoOfBeneficiaries || 0,
        totalUtilisedQuantity: doc.totalUtilisedQuantity || 0,
        totalUtilisedAmount: doc.totalUtilisedAmount || 0,
        totalUtilisedLHWRF: doc.totalUtilisedLHWRF || 0,
        totalUtilisedCC: doc.totalUtilisedCC || 0,
        totalUtilisedExtGrant: doc.totalUtilisedExtGrant || 0,
        totalUtilisedConvergence: doc.totalUtilisedConvergence || 0,
        totalNoOfHouseholds: doc.totalNoOfHouseholds || 0,
        totalNoOfBeneficiaries: doc.totalNoOfBeneficiaries || 0,
        percentageUtilizedAgainstPlan: doc.percentageUtilizedAgainstPlan || 0,
        balanceAmount: doc.balanceAmount || 0,
      }));

      if (allRecs.length > 0) {
        processedData.push({
          centerName: "Total",
          program: "-",
          project: "-",
          activityName: "-",
          subactivityName: "-",
          plannedUnit: "-",
          quarter: "-",
          plannedQuantity: totalPlannedQuantity,
          plannedAmount: totalPlannedAmount,
          plannedLHWRF: totalPlannedLHWRF,
          plannedCC: totalPlannedCC,
          plannedExtGrant: totalPlannedExtGrant,
          plannedConvergence: totalPlannedConvergence,
          plannedNoOfHouseholds: totalPlannedNoOfHouseholds,
          plannedNoOfBeneficiaries: totalPlannedNoOfBeneficiaries,
          totalUtilisedQuantity: totalUtilisedQuantity,
          totalUtilisedAmount: totalUtilisedAmount,
          totalUtilisedLHWRF: totalUtilisedLHWRF,
          totalUtilisedCC: totalUtilisedCC,
          totalUtilisedExtGrant: totalUtilisedExtGrant,
          totalUtilisedConvergence: totalUtilisedConvergence,
          totalNoOfHouseholds: totalNoOfHouseholds,
          totalNoOfBeneficiaries: totalNoOfBeneficiaries,
          percentageUtilizedAgainstPlan: totalPlannedAmount > 0 ? Math.round((totalUtilisedAmount / totalPlannedAmount) * 100 * 100) / 100 : 0,
          balanceAmount: totalPlannedAmount - totalUtilisedAmount,
        });
      }

      res.status(200).json({
        totalRecs: allRecs.length,
        tableData: processedData,
        success: true,
      });
    } catch (error) {
      // console.log("Error in plan vs utilisation => ", error);
      res.status(500).json({ errorMsg: error.message, success: false });
    }
  };

  exports.plan_vs_utilization_report2 = (req, res, next) => {
    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);
    var query = {};
    // console.log("req.body", req.body);
    if (req.body.year !== "all") {
      query.year = req.body.year;
    }
    if (req.body.quarter !== "all") query.quarter = req.body.quarter;

    if (req.body.center_ID !== "all")
      query.center_id = new ObjectId(req.body.center_ID);

    if (req.body.program_id !== "all") {
      query.program_id = new ObjectId(req.body.program_id);
    }
    if (req.body.project_id !== "all") {
      query.project_id = new ObjectId(req.body.project_id);
    }
    if (req.body.activityName_id !== "all") {
      query.activityName_id = new ObjectId(req.body.activityName_id);
    }
    if (req.body.subactivityName_id !== "all") {
      query.subactivityName_id = new ObjectId(req.body.subactivityName_id);
    }


    let utilStartDate = req.body.fromDate;
    let utilEndDate = req.body.toDate;

    // console.log("utilStartDate", utilStartDate);
    // console.log("utilEndDate", utilEndDate);
    //  search text condition
    if (req.body.searchText !== "-") {
      const searchRegex = new RegExp(req.body.searchText, "i"); // 'i' for case-insensitive
      query.$or = [
        { centerName: searchRegex },
        { program: searchRegex },
        { project: searchRegex },
        { activityName: searchRegex },
        { subactivityName: searchRegex },
        { unit: searchRegex },
      ];
    }
    // console.log("query", JSON.stringify(query, null, 2));

    let paginatedDataStages = [{
      $sort: {
        centerName: 1,             // ascending
        program: 1,
        project: 1,
        activityName: 1,
        subactivityName: 1,
        quarterOrder: 1 // Ensures proper Q1 → Q4 sorting
      }
    }];
    if (!req.body.removePagination) {
      paginatedDataStages.push(
        { $skip: parseInt(skipRec) },
        { $limit: parseInt(recsPerPage) }
      );
    }

    AnnualPlan.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "utilizationdetails",
          let: {
            center_id: "$center_id",
            program_id: "$program_id",
            project_id: "$project_id",
            activityName_id: "$activityName_id",
            subactivityName_id: "$subactivityName_id",
            utilStartDate: utilStartDate,
            utilEndDate: utilEndDate

            // utilStartDate:  "$startDate",
            // utilEndDate:  "$endDate",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$center_id", "$$center_id"] },
                    { $eq: ["$program_id", "$$program_id"] },
                    { $eq: ["$project_id", "$$project_id"] },
                    { $eq: ["$activityName_id", "$$activityName_id"] },
                    { $eq: ["$subactivityName_id", "$$subactivityName_id"] },
                    { $gte: ["$voucherDate", "$$utilStartDate"] },  // << user date
                    { $lte: ["$voucherDate", "$$utilEndDate"] }     // << user date

                    // { $gte: ["$voucherDate", utilStartDate] },
                    // { $lte: ["$voucherDate", utilEndDate] }
                    // { $gte: ["$voucherDate", req.body.fromDate] },
                    // { $lte: ["$voucherDate", req.body.toDate] }

                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                quantity: { $sum: { $ifNull: ["$quantity", 0] } },
                totalUtilizedAmount: { $sum: { $ifNull: ["$totalCost", 0] } },
                utilized_LHWRF: { $sum: { $ifNull: ["$sourceofFund.LHWRF", 0] } },
                utilized_Grant: { $sum: { $ifNull: ["$sourceofFund.grant", 0] } },
                utilized_CC: { $sum: { $ifNull: ["$sourceofFund.CC", 0] } },
                utilized_Convergence: { $sum: { $ifNull: ["$convergence", 0] } },
                noOfHouseholds: { $sum: { $ifNull: ["$noOfHouseholds", 0] } },
                noOfBeneficiaries: { $sum: { $ifNull: ["$noOfBeneficiaries", 0] } }
              }
            },
            {
              $project: {

                quantity: { $ifNull: ["$quantity", 0] },
                totalUtilizedAmount: { $ifNull: ["$totalUtilizedAmount", 0] },
                utilized_LHWRF: { $ifNull: ["$utilized_LHWRF", 0] },
                utilized_Grant: { $ifNull: ["$utilized_Grant", 0] },
                utilized_CC: { $ifNull: ["$utilized_CC", 0] },
                utilized_Convergence: { $ifNull: ["$utilized_Convergence", 0] },
                noOfHouseholds: { $ifNull: ["$noOfHouseholds", 0] },
                noOfBeneficiaries: { $ifNull: ["$noOfBeneficiaries", 0] }
              }
            }
          ],
          as: "utilizationData"
        }
      },

      {
        $addFields: {
          utilization: {
            $ifNull: [{ $arrayElemAt: ["$utilizationData", 0] }, {
              quantity: 0,
              totalUtilizedAmount: 0,
              utilized_LHWRF: 0,
              utilized_Grant: 0,
              utilized_CC: 0,
              utilized_Convergence: 0,
              noOfHouseholds: 0,
              noOfBeneficiaries: 0
            }]
          }
        }
      },
      {
        $group: {
          _id: {
            centerName: "$centerName",
            program: "$program",
            project: "$project",
            activityName: "$activityName",
            subactivityName: "$subactivityName",
            plannedUnit: "$unit",
            quarter: "$quarter",
            totalUtilisedQuantity: { $ifNull: ["$utilization.quantity", 0] },
            totalUtilisedAmount: { $ifNull: ["$utilization.totalUtilizedAmount", 0] },
            totalUtilisedLHWRF: { $ifNull: ["$utilization.utilized_LHWRF", 0] },
            totalUtilisedCC: { $ifNull: ["$utilization.utilized_Grant", 0] },
            totalUtilisedExtGrant: { $ifNull: ["$utilization.utilized_CC", 0] },
            totalUtilisedConvergence: { $ifNull: ["$utilization.utilized_Convergence", 0] },
            totalNoOfHouseholds: { $ifNull: ["$utilization.noOfHouseholds", 0] },
            totalNoOfBeneficiaries: { $ifNull: ["$utilization.noOfBeneficiaries", 0] },
          },
          plannedQuantity: { $sum: "$quantity" },
          plannedAmount: { $sum: "$totalCost" },
          plannedLHWRF: { $sum: "$sourceofFund.LHWRF" },
          plannedCC: { $sum: "$sourceofFund.CC" },
          plannedExtGrant: { $sum: "$sourceofFund.grant" },
          plannedConvergence: { $sum: "$convergence" },
          plannedNoOfHouseholds: { $sum: "$noOfHouseholds" },
          plannedNoOfBeneficiaries: { $sum: "$noOfBeneficiaries" },
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
          plannedUnit: "$_id.plannedUnit",
          quarter: "$_id.quarter",
          plannedQuantity: 1,
          plannedAmount: 1,
          plannedLHWRF: 1,
          plannedCC: 1,
          plannedExtGrant: 1,
          plannedConvergence: 1,
          plannedNoOfHouseholds: 1,
          plannedNoOfBeneficiaries: 1,
          totalUtilisedQuantity: "$_id.totalUtilisedQuantity",
          totalUtilisedAmount: "$_id.totalUtilisedAmount",
          totalUtilisedLHWRF: "$_id.totalUtilisedLHWRF",
          totalUtilisedCC: "$_id.totalUtilisedCC",
          totalUtilisedExtGrant: "$_id.totalUtilisedExtGrant",
          totalUtilisedConvergence: "$_id.totalUtilisedConvergence",
          totalNoOfHouseholds: "$_id.totalNoOfHouseholds",
          totalNoOfBeneficiaries: "$_id.totalNoOfBeneficiaries",
        },
      },
      {
        $addFields: {
          quarterOrder: {
            $toInt: { $substr: ["$quarter", 1, -1] } // Extracts number part from "Q1", "Q2", ...
          }
        }
      },

      {
        $addFields: {
          percentageUtilizedAgainstPlan: {
            $cond: [
              { $gt: ["$plannedAmount", 0] },
              {
                $round: [
                  { $multiply: [{ $divide: ["$totalUtilisedAmount", "$plannedAmount"] }, 100] },
                  2
                ]
              },
              0
            ]
          },
          balanceAmount: {
            $subtract: ["$plannedAmount", { $ifNull: ["$totalUtilisedAmount", 0] }]
          }
        }
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
        // console.log("response", response);
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
        var balanceAmount = 0;
        var data = response[0].paginatedData.map((doc) => ({
          centerName: doc.centerName,
          program: doc.program,
          project: doc.project,
          activityName: doc.activityName,
          subactivityName: doc.subactivityName,
          plannedUnit: doc.plannedUnit,
          quarter: doc.quarter,
          plannedQuantity: doc.plannedQuantity,
          plannedAmount: doc.plannedAmount,
          plannedLHWRF: doc.plannedLHWRF,
          plannedCC: doc.plannedCC,
          plannedExtGrant: doc.plannedExtGrant,
          plannedConvergence: doc.plannedConvergence,
          plannedNoOfHouseholds: doc.plannedNoOfHouseholds,
          plannedNoOfBeneficiaries: doc.plannedNoOfBeneficiaries,
          totalUtilisedQuantity: doc.totalUtilisedQuantity,
          totalUtilisedAmount: doc.totalUtilisedAmount,
          totalUtilisedLHWRF: doc.totalUtilisedLHWRF,
          totalUtilisedCC: doc.totalUtilisedCC,
          totalUtilisedExtGrant: doc.totalUtilisedExtGrant,
          totalUtilisedConvergence: doc.totalUtilisedConvergence,
          totalNoOfHouseholds: doc.totalNoOfHouseholds,
          totalNoOfBeneficiaries: doc.totalNoOfBeneficiaries,
          percentageUtilizedAgainstPlan: doc.percentageUtilizedAgainstPlan,
          balanceAmount: doc.balanceAmount,
        }));

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
            plannedUnit: "-",
            quarter: "-",
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
        // console.log("data", data)
        res.status(200).json({
          totalRecs: response[0].totalRecords,
          tableData: data,
          success: true,
        });
      })
      .catch((error) => {
        console.log("Error in plan vs utilisation  => ", error);
        res.status(500).json({ errorMsg: error.message, success: false });
      });
  };


  function getFinancialYearDates(financialYear) {
    const [startYear, endYearSuffix] = financialYear.split("-").map(Number);
    const startDate = new Date(`${startYear}-04-01`);
    const endDate = new Date(`${startYear + 1}-03-31`);
    const formatToYYYYMMDD = (date) => {
      const year = date.getFullYear();
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatToYYYYMMDD(startDate),
      endDate: formatToYYYYMMDD(endDate),
    };
  }
  function getFinancialYearFromDate(date) {
    const givenDate = new Date(date);
    const year = givenDate.getFullYear();
    const month = givenDate.getMonth() + 1; // Month is 0-indexed

    if (month >= 4) {
      // If the month is April (4) or later, financial year starts in this year and ends next year
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      // If the month is before April, financial year starts in the previous year and ends this year
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  }

  exports.fund_status_reportOld = (req, res, next) => {
    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);
    var startDate = req.body.fromDate;
    var endDate = req.body.toDate;

    const financialYear = getFinancialYearFromDate(endDate); // base year from toDate

    // --------------------------
    // Base match conditions
    // --------------------------
    let matchQuery = { year: financialYear.toString() };

    if (req.body.center_ID !== "all") {
      matchQuery.center_id = new ObjectId(req.body.center_ID);
    }
    if (req.body.program_id !== "all") {
      matchQuery.program_id = new ObjectId(req.body.program_id);
    }
    if (req.body.project_id !== "all") {
      matchQuery.project_id = new ObjectId(req.body.project_id);
    }
    if (req.body.activityName_id !== "all") {
      matchQuery.activityName_id = new ObjectId(req.body.activityName_id);
    }
    if (req.body.subactivityName_id !== "all") {
      matchQuery.subactivityName_id = new ObjectId(req.body.subactivityName_id);
    }

    let searchStage = [];
    if (req.body.searchText && req.body.searchText !== "-") {
      const searchRegex = new RegExp(req.body.searchText, "i");
      searchStage.push({
        $match: {
          $or: [
            { centerName: searchRegex },
            { program: searchRegex },
            { project: searchRegex },
            { activityName: searchRegex },
            { subactivityName: searchRegex },
          ],
        },
      });
    }

    let paginatedDataStages = [];
    if (!req.body.removePagination) {
      paginatedDataStages.push(
        { $skip: parseInt(skipRec) },
        { $limit: parseInt(recsPerPage) }
      );
    }

    AnnualPlan.aggregate([
      { $match: matchQuery },
      ...searchStage,

      // ---------------- Lookup Fund Receipts ----------------
      {
        $lookup: {
          from: "fundreceipts",
          let: {
            center_id: "$center_id",
            program_id: "$program_id",
            project_id: "$project_id",
            activityName_id: "$activityName_id",
            subactivityName_id: "$subactivityName_id",
            fundStartDate: startDate,
            fundEndDate: endDate,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [ 
                    { $eq: ["$center_id", "$$center_id"] },
                    { $eq: ["$program_id", "$$program_id"] },
                    { $eq: ["$project_id", "$$project_id"] },
                    { $eq: ["$activityName_id", "$$activityName_id"] },
                    { $eq: ["$subactivityName_id", "$$subactivityName_id"] },
                    ...(req.body.fromDate !== "all"
                      ? [{ $gte: ["$amountReceivedDate", "$$fundStartDate"] }]
                      : []),
                    ...(req.body.toDate !== "all"
                      ? [{ $lte: ["$amountReceivedDate", "$$fundEndDate"] }]
                      : []),
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                fundReceiptCC: {
                  $sum: {
                    $cond: [
                      { $eq: ["$fundType", "Community Contribution"] },
                      "$amountReceived",
                      0,
                    ],
                  },
                },
                fundReceiptExtGrant: {
                  $sum: {
                    $cond: [
                      { $eq: ["$fundType", "External Grant"] },
                      "$amountReceived",
                      0,
                    ],
                  },
                },
              },
            },
          ],
          as: "funds",
        },
      },

      // ---------------- Lookup Utilisations ----------------
      {
        $lookup: {
          from: "utilizationdetails",
          let: {
            center_id: "$center_id",
            program_id: "$program_id",
            project_id: "$project_id",
            activityName_id: "$activityName_id",
            subactivityName_id: "$subactivityName_id",
            utilStartDate: startDate,
            utilEndDate: endDate,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$center_id", "$$center_id"] },
                    { $eq: ["$program_id", "$$program_id"] },
                    { $eq: ["$project_id", "$$project_id"] },
                    { $eq: ["$activityName_id", "$$activityName_id"] },
                    { $eq: ["$subactivityName_id", "$$subactivityName_id"] },
                    { $gte: ["$voucherDate", "$$utilStartDate"] },
                    { $lte: ["$voucherDate", "$$utilEndDate"] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                utilisedLHWRF: { $sum: "$sourceofFund.LHWRF" },
                utilisedCC: { $sum: "$sourceofFund.CC" },
                utilisedExtGrant: { $sum: "$sourceofFund.grant" },
              },
            },
          ],
          as: "utilisation",
        },
      },
      // ---------------- Initial Projection ----------------
      {
        $project: {
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

          plannedLHWRF: { $ifNull: ["$sourceofFund.LHWRF", 0] },
          plannedCC: { $ifNull: ["$sourceofFund.CC", 0] },
          plannedExtGrant: { $ifNull: ["$sourceofFund.grant", 0] },

          fundReceiptCC: {
            $ifNull: [{ $arrayElemAt: ["$funds.fundReceiptCC", 0] }, 0],
          },
          fundReceiptExtGrant: {
            $ifNull: [{ $arrayElemAt: ["$funds.fundReceiptExtGrant", 0] }, 0],
          },

          utilisedLHWRF: {
            $ifNull: [{ $arrayElemAt: ["$utilisation.utilisedLHWRF", 0] }, 0],
          },
          utilisedCC: {
            $ifNull: [{ $arrayElemAt: ["$utilisation.utilisedCC", 0] }, 0],
          },
          utilisedExtGrant: {
            $ifNull: [{ $arrayElemAt: ["$utilisation.utilisedExtGrant", 0] }, 0],
          },
        },
      },
      // ---------------- Group by Unique Combination ----------------
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
          },
          
          plannedLHWRF: { $sum : "$plannedLHWRF"},
          plannedCC: { $sum : "$plannedCC"},
          plannedExtGrant: { $sum : "$plannedExtGrant"},
          fundReceiptCC: { $sum: "$fundReceiptCC" },
          fundReceiptExtGrant: { $sum: "$fundReceiptExtGrant" },
          utilisedLHWRF: { $sum: "$utilisedLHWRF" },
          utilisedCC: { $sum: "$utilisedCC" },
          utilisedExtGrant: { $sum: "$utilisedExtGrant" }
        },
      },

      // ---------------- Final Projection ----------------
      {
        $project: {
          _id:0,
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
          plannedLHWRF: 1,
          plannedCC: 1,
          plannedExtGrant: 1,
          fundReceiptCC: 1,
          fundReceiptExtGrant: 1,
          utilisedLHWRF: 1,
          utilisedCC: 1,
          utilisedExtGrant: 1,
        },
      },
      // ---------------- Pagination & Count ----------------
      {
        $facet: {
          totalRecords: [{ $count: "count" }],
          paginatedData: paginatedDataStages,
        },
      },
      {
        $project: {
          totalRecords: {
            $ifNull: [{ $arrayElemAt: ["$totalRecords.count", 0] }, 0],
          },
          paginatedData: 1,
        },
      },
    ])
      
      .then((response) => {
        let data = response[0].paginatedData || [];
        console.log("fund_status_report data", data);
        // ---------------- Totals Row ----------------
        let totals = {
          centerName: "Total",
          program: "-",
          project: "-",
          activityName: "-",
          subactivityName: "-",
          program_id: "-",
          project_id: "-",
          activityName_id: "-",
          subactivityName_id: "-",

          plannedExtGrant: 0,
          fundReceiptExtGrant: 0,
          utilisedExtGrant: 0,

          plannedCC: 0,
          fundReceiptCC: 0,
          utilisedCC: 0,

          plannedLHWRF: 0,
          utilisedLHWRF: 0,
        };

        data.forEach((row) => {
          totals.plannedExtGrant += row.plannedExtGrant || 0;
          totals.fundReceiptExtGrant += row.fundReceiptExtGrant || 0;
          totals.utilisedExtGrant += row.utilisedExtGrant || 0;

          totals.plannedCC += row.plannedCC || 0;
          totals.fundReceiptCC += row.fundReceiptCC || 0;
          totals.utilisedCC += row.utilisedCC || 0;
          totals.plannedLHWRF += row.plannedLHWRF || 0;
          totals.utilisedLHWRF += row.utilisedLHWRF || 0;
        });
        console.log("totals", totals);
        if (data.length > 0) data.push(totals);

        res.status(200).json({
          totalRecs: response[0].totalRecords,
          tableData: data,
          success: true,
        });
      })
      .catch((error) => {
        console.log("Error in fund_status_report => ", error);
        res.status(500).json({ errorMsg: error.message, success: false });
      });
  };

  exports.fund_status_report = (req, res, next) => {
    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);
    var startDate = req.body.fromDate;
    var endDate = req.body.toDate;

    const financialYear = getFinancialYearFromDate(endDate); // base year from toDate

    // --------------------------
    // Base match conditions
    // --------------------------
    let matchQuery = { year: financialYear.toString() };

    if (req.body.center_ID !== "all") {
      matchQuery.center_id = new ObjectId(req.body.center_ID);
    }
    if (req.body.program_id !== "all") {
      matchQuery.program_id = new ObjectId(req.body.program_id);
    }
    if (req.body.project_id !== "all") {
      matchQuery.project_id = new ObjectId(req.body.project_id);
    }
    if (req.body.activityName_id !== "all") {
      matchQuery.activityName_id = new ObjectId(req.body.activityName_id);
    }
    if (req.body.subactivityName_id !== "all") {
      matchQuery.subactivityName_id = new ObjectId(req.body.subactivityName_id);
    }

    let searchStage = [];
    if (req.body.searchText && req.body.searchText !== "-") {
      const searchRegex = new RegExp(req.body.searchText, "i");
      searchStage.push({
        $match: {
          $or: [
            { centerName: searchRegex },
            { program: searchRegex },
            { project: searchRegex },
            { activityName: searchRegex },
            { subactivityName: searchRegex },
          ],
        },
      });
    }

    let paginatedDataStages = [];
    if (!req.body.removePagination) {
      paginatedDataStages.push(
        { $skip: parseInt(skipRec) },
        { $limit: parseInt(recsPerPage) }
      );
    }

      AnnualPlan.aggregate([
        { $match: matchQuery },
        ...searchStage,

        // ---------------- Group by Unique Combination First (Sum Planned Only) ----------------
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
            },
            plannedLHWRF: { $sum: { $ifNull: ["$sourceofFund.LHWRF", 0] } },
            plannedCC: { $sum: { $ifNull: ["$sourceofFund.CC", 0] } },
            plannedExtGrant: { $sum: { $ifNull: ["$sourceofFund.grant", 0] } },
          },
        },

        // ---------------- Lookup Fund Receipts (After Grouping) ----------------
        {
          $lookup: {
            from: "fundreceipts",
            let: {
              center_id: "$_id.center_id",
              program_id: "$_id.program_id",
              project_id: "$_id.project_id",
              activityName_id: "$_id.activityName_id",
              subactivityName_id: "$_id.subactivityName_id",
              fundStartDate: startDate,
              fundEndDate: endDate,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [ 
                      { $eq: ["$center_id", "$$center_id"] },
                      { $eq: ["$program_id", "$$program_id"] },
                      { $eq: ["$project_id", "$$project_id"] },
                      { $eq: ["$activityName_id", "$$activityName_id"] },
                      { $eq: ["$subactivityName_id", "$$subactivityName_id"] },
                      ...(req.body.fromDate !== "all"
                        ? [{ $gte: ["$amountReceivedDate", "$$fundStartDate"] }]
                        : []),
                      ...(req.body.toDate !== "all"
                        ? [{ $lte: ["$amountReceivedDate", "$$fundEndDate"] }]
                        : []),
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  fundReceiptCC: {
                    $sum: {
                      $cond: [
                        { $eq: ["$fundType", "Community Contribution"] },
                        "$amountReceived",
                        0,
                      ],
                    },
                  },
                  fundReceiptExtGrant: {
                    $sum: {
                      $cond: [
                        { $eq: ["$fundType", "External Grant"] },
                        "$amountReceived",
                        0,
                      ],
                    },
                  },
                },
              },
            ],
            as: "funds",
          },
        },

        // ---------------- Lookup Utilisations (After Grouping) ----------------
        {
          $lookup: {
            from: "utilizationdetails",
            let: {
              center_id: "$_id.center_id",
              program_id: "$_id.program_id",
              project_id: "$_id.project_id",
              activityName_id: "$_id.activityName_id",
              subactivityName_id: "$_id.subactivityName_id",
              utilStartDate: startDate,
              utilEndDate: endDate,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$center_id", "$$center_id"] },
                      { $eq: ["$program_id", "$$program_id"] },
                      { $eq: ["$project_id", "$$project_id"] },
                      { $eq: ["$activityName_id", "$$activityName_id"] },
                      { $eq: ["$subactivityName_id", "$$subactivityName_id"] },
                      { $gte: ["$voucherDate", "$$utilStartDate"] },
                      { $lte: ["$voucherDate", "$$utilEndDate"] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  utilisedLHWRF: { $sum: "$sourceofFund.LHWRF" },
                  utilisedCC: { $sum: "$sourceofFund.CC" },
                  utilisedExtGrant: { $sum: "$sourceofFund.grant" },
                },
              },
            ],
            as: "utilisation",
          },
        },

        // ---------------- Final Projection ----------------
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

            plannedLHWRF: 1,
            plannedCC: 1,
            plannedExtGrant: 1,

            fundReceiptCC: {
              $ifNull: [{ $arrayElemAt: ["$funds.fundReceiptCC", 0] }, 0],
            },
            fundReceiptExtGrant: {
              $ifNull: [{ $arrayElemAt: ["$funds.fundReceiptExtGrant", 0] }, 0],
            },

            utilisedLHWRF: {
              $ifNull: [{ $arrayElemAt: ["$utilisation.utilisedLHWRF", 0] }, 0],
            },
            utilisedCC: {
              $ifNull: [{ $arrayElemAt: ["$utilisation.utilisedCC", 0] }, 0],
            },
            utilisedExtGrant: {
              $ifNull: [{ $arrayElemAt: ["$utilisation.utilisedExtGrant", 0] }, 0],
            },
          },
        },

        // ---------------- Pagination & Count ----------------
        {
          $facet: {
            totalRecords: [{ $count: "count" }],
            paginatedData: paginatedDataStages,
          },
        },
        {
          $project: {
            totalRecords: {
              $ifNull: [{ $arrayElemAt: ["$totalRecords.count", 0] }, 0],
            },
            paginatedData: 1,
          },
        },
      ])
      .then((response) => {
        let data = response[0].paginatedData || [];
        // ---------------- Totals Row ----------------
        let totals = {
          centerName: "Total",
          program: "-",
          project: "-",
          activityName: "-",
          subactivityName: "-",
          program_id: "-",
          project_id: "-",
          activityName_id: "-",
          subactivityName_id: "-",

          plannedExtGrant: 0,
          fundReceiptExtGrant: 0,
          utilisedExtGrant: 0,

          plannedCC: 0,
          fundReceiptCC: 0,
          utilisedCC: 0,

          plannedLHWRF: 0,
          utilisedLHWRF: 0,
        };

        data.forEach((row) => {
          totals.plannedExtGrant += row.plannedExtGrant || 0;
          totals.fundReceiptExtGrant += row.fundReceiptExtGrant || 0;
          totals.utilisedExtGrant += row.utilisedExtGrant || 0;

          totals.plannedCC += row.plannedCC || 0;
          totals.fundReceiptCC += row.fundReceiptCC || 0;
          totals.utilisedCC += row.utilisedCC || 0;
          totals.plannedLHWRF += row.plannedLHWRF || 0;
          totals.utilisedLHWRF += row.utilisedLHWRF || 0;
        });
        console.log("totals", totals);
        if (data.length > 0) data.push(totals);

        res.status(200).json({
          totalRecs: response[0].totalRecords,
          tableData: data,
          success: true,
        });
      })
      .catch((error) => {
        console.log("Error in fund_status_report => ", error);
        res.status(500).json({ errorMsg: error.message, success: false });
      });
  };

  exports.convergence_report = (req, res, next) => {
    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);

    let query = {};

    if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
      query.approvalDate = {
        $gte: req.body.fromDate,
        $lte: req.body.toDate,
      };
    }

    if (req.body.center_ID !== "all")
      query.center_id = new ObjectId(req.body.center_ID);
    if (req.body.program_id !== "all")
      query.program_id = new ObjectId(req.body.program_id);
    if (req.body.project_id !== "all")
      query.project_id = new ObjectId(req.body.project_id);
    if (req.body.activityName_id !== "all")
      query.activityName_id = new ObjectId(req.body.activityName_id);
    if (req.body.subactivityName_id !== "all")
      query.subactivityName_id = new ObjectId(req.body.subactivityName_id);

    // Search filter
    if (req.body.searchText !== "-") {
      const searchRegex = new RegExp(req.body.searchText, "i");
      query.$or = [
        { centerName: searchRegex },
        { program: searchRegex },
        { project: searchRegex },
        { activityName: searchRegex },
        { subactivityName: searchRegex },
        { unit: searchRegex },
      ];
    }

    let paginationStages = [{ $sort: { centerName : 1 } }];
    if (!req.body.removePagination) {
      paginationStages.push(
        { $skip: parseInt(skipRec) },
        { $limit: parseInt(recsPerPage) }
      );
    }

    Utilization.aggregate([
      { $match: query },
      {
        $match: {
          convergence: { $exists: true, $ne: null, $ne: 0 },
        },
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
          convergenceAgencyName: 1,
          convergenceNote: 1,
          utilizationUnit: "$unit",
          utilizationUnitCost: "$unitCost",
          utilizationQuantity: "$quantity",
          totalConvergence: "$convergence",
          utilizationNoOfHouseholds: "$noOfHouseholds",
          utilizationNoOfBeneficiaries: "$noOfBeneficiaries",
          convergenceDocumentUrl: "$convergenceDocumentUrl", // Include supporting documents
          convergenceDocumentName: "$S3ConvergenceDocumentName", // Include supporting documents
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
            utilizationUnit: "$utilizationUnit",
            convergenceAgencyName: "$convergenceAgencyName",
            convergenceNote: "$convergenceNote",
            convergenceDocumentName: "$convergenceDocumentName",
            convergenceDocumentUrl: "$convergenceDocumentUrl",
          },
          totalUtilisedUnitCost: { $sum: "$utilizationUnitCost" },
          totalUtilisedQuantity: { $sum: "$utilizationQuantity" },
          totalConvergence: { $sum: "$totalConvergence" },
          totalNoOfHouseholds: { $sum: "$utilizationNoOfHouseholds" },
          totalNoOfBeneficiaries: { $sum: "$utilizationNoOfBeneficiaries" },
        },
      },
      {
        $project: {
          _id: 0,
          centerName: { $ifNull: ["$_id.centerName", "--NA--"] },
          program: { $ifNull: ["$_id.program", "--NA--"] },
          project: { $ifNull: ["$_id.project", "--NA--"] },
          activityName: { $ifNull: ["$_id.activityName", "--NA--"] },
          subactivityName: { $ifNull: ["$_id.subactivityName", "--NA--"] },
          center_id: { $ifNull: ["$_id.center_id", "--NA--"] },
          program_id: { $ifNull: ["$_id.program_id", "--NA--"] },
          project_id: { $ifNull: ["$_id.project_id", "--NA--"] },
          activityName_id: { $ifNull: ["$_id.activityName_id", "--NA--"] },
          subactivityName_id: { $ifNull: ["$_id.subactivityName_id", "--NA--"] },
          utilizationUnit: { $ifNull: ["$_id.utilizationUnit", "--NA--"] },
          totalUtilisedUnitCost: { $ifNull: ["$totalUtilisedUnitCost", 0] },
          totalUtilisedQuantity: { $ifNull: ["$totalUtilisedQuantity", 0] },
          totalConvergence: { $ifNull: ["$totalConvergence", 0] },
          convergenceAgencyName: {
            $ifNull: ["$_id.convergenceAgencyName", "--NA--"],
          },
          totalNoOfHouseholds: { $ifNull: ["$totalNoOfHouseholds", 0] },
          totalNoOfBeneficiaries: { $ifNull: ["$totalNoOfBeneficiaries", 0] },
          convergenceNote: { $ifNull: ["$_id.convergenceNote", "--NA--"] },

          convergenceDocumentName: {
            $ifNull: ["$_id.convergenceDocumentName", "--NA--"],
          },
          convergenceDocumentUrl: {
            $ifNull: ["$_id.convergenceDocumentUrl", "--NA--"],
          },
          // supportingDocHtml: {
          //   $cond: {
          //     if: { $ne: ["$convergenceDocumentUrl", null] },
          //     then: {
          //       $concat: [
          //         '<a href="',
          //         "$convergenceDocumentUrl",
          //         '" target="_blank" download>',
          //         '<i class="fa fa-file"></i> Document</a>',
          //       ],
          //     },
          //     else: "--NA--",
          //   },
          // },
        },
      },
      {
        $facet: {
          totalRecords: [{ $count: "count" }],
          paginatedData: paginationStages,
        },
      },
      {
        $project: {
          totalRecords: {
            $ifNull: [{ $arrayElemAt: ["$totalRecords.count", 0] }, 0],
          },
          paginatedData: 1,
        },
      },
    ])
      .then((response) => {
        let data = response[0].paginatedData;

        // console.log("convergence report data", data);

        if (data.length > 0) {
          data.push({
            centerName: "Total",
            program: "-",
            project: "-",
            activityName: "-",
            subactivityName: "-",
            center_id: "-",
            program_id: "-",
            project_id: "-",
            activityName_id: "-",
            subactivityName_id: "-",
            utilizationUnit: "-",
            totalUtilisedUnitCost: data.reduce(
              (sum, item) => sum + (item.totalUtilisedUnitCost || 0),
              0
            ),
            totalUtilisedQuantity: data.reduce(
              (sum, item) => sum + (item.totalUtilisedQuantity || 0),
              0
            ),
            totalConvergence: data.reduce(
              (sum, item) => sum + (item.totalConvergence || 0),
              0
            ),
            convergenceAgencyName: "-",
            totalNoOfHouseholds: data.reduce(
              (sum, item) => sum + (item.totalNoOfHouseholds || 0),
              0
            ),
            totalNoOfBeneficiaries: data.reduce(
              (sum, item) => sum + (item.totalNoOfBeneficiaries || 0),
              0
            ),
            convergenceNote: "-",
            supportingDocHtml: "-",
            convergenceDocumentName: "-",
            convergenceDocumentUrl: "-",
          });
        }

        res.status(200).json({
          tableData: data,
          totalRecs: response[0].totalRecords,
          success: true,
        });
      })
      .catch((error) => {
        console.error("Error in convergence_report => ", error);
        res.status(500).json({ errorMsg: error.message, success: false });
      });
  };

  exports.plantation_report = (req, res, next) => {
    // console.log("plantation_report req.body => ", req.body);

    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);
    let query = {};

    if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
      query["plantationDetails.plantationDate"] = {
        $gte: req.body.fromDate,
        $lte: req.body.toDate,
      };
    }

    if (req.body.centerName !== "all") {
      query.centerName = req.body.centerName;
    }
    if (req.body.district !== "all") {
      query["locationDetails.district"] = req.body.district;
    }
    if (req.body.block !== "all") {
      query["locationDetails.block"] = req.body.block;
    }
    if (req.body.speciesName !== "all") {
      query["plantationDetails.speciesDetails.speciesName"] =
        req.body.speciesName;
    }

    if (req.body.searchText !== "-") {
      const searchRegex = new RegExp(req.body.searchText, "i");
      query.$or = [
        { centerName: searchRegex },
        { project: searchRegex },
        { "locationDetails.district": searchRegex },
        { "locationDetails.block": searchRegex },
        { "locationDetails.village": searchRegex },
        { "plantationDetails.speciesDetails.speciesName": searchRegex },
        { "farmerDetails.farmerName": searchRegex },
        { "locationDetails.gatKasara": searchRegex },
        { "locationDetails.state": searchRegex },
      ];
    }

    // console.log("plantation_report Query => ", query);

    Plantation.countDocuments(query)
      .then((totalRecs) => {
        // console.log("totalRecs => ", totalRecs);
        let plantationQuery = Plantation.find(query);
        if (!req.body.removePagination) {
          plantationQuery = plantationQuery
            .skip(parseInt(skipRec))
            .limit(parseInt(recsPerPage));
        }
        plantationQuery
          .sort({ createdAt: -1 })
          .then((data) => {
            // console.log("plantation_report data => ", data);
            res.status(200).json({
              totalRecs: totalRecs,
              tableData: data,
              success: true,
            });
          })
          .catch((error) => {
            console.error("Error in plantation report => ", error);
            res.status(500).json({ errorMsg: error.message, success: false });
          });
      })
      .catch((error) => {
        console.error("Error in plantation report => ", error);
        res.status(500).json({ errorMsg: error.message, success: false });
      });
  };

  exports.wrd_report = (req, res, next) => {
    // console.log("req.body", req.body);
    let recsPerPage = req.body.recsPerPage;
    let pageNum = req.body.pageNumber;
    let skipRec = recsPerPage * (pageNum - 1);
    let query = {};

    if (req.body.fromDate !== "all" && req.body.toDate !== "all") {
      query["wrdDetails.constructionDate"] = {
        $gte: req.body.fromDate,
        $lte: req.body.toDate,
      };
    }

    if (req.body.centerName !== "all") query.centerName = req.body.centerName;
    if (req.body.district !== "all")
      query["locationDetails.district"] = req.body.district;
    if (req.body.block !== "all") query["locationDetails.block"] = req.body.block;
    if (req.body.soilType !== "all")
      query["wrdDetails.soilType"] = req.body.soilType;

    if (req.body.searchText !== "-") {
      const searchRegex = new RegExp(req.body.searchText, "i");
      query.$or = [
        { centerName: searchRegex },
        { project: searchRegex },
        { "locationDetails.district": searchRegex },
        { "locationDetails.block": searchRegex },
        { "locationDetails.village": searchRegex },
        { "wrdDetails.soilType": searchRegex },
        { "farmerDetails.farmerName": searchRegex },
        { "locationDetails.gatKasara": searchRegex },
        { "locationDetails.state": searchRegex },
      ];
    }
    WRD.countDocuments(query)
      .then((totalRecs) => {
        // console.log("totalRecs => ", totalRecs);
        let wrdQuery = WRD.find(query);
        if (!req.body.removePagination) {
          wrdQuery = wrdQuery
            .skip(parseInt(skipRec))
            .limit(parseInt(recsPerPage));
        }
        wrdQuery
          .sort({ createdAt: -1 })
          .then((data) => {
            // console.log("Total WRD records found => ", data.length);
            res.status(200).json({
              totalRecs: totalRecs,
              tableData: data,
              success: true,
            });
          })
          .catch((error) => {
            console.error("Error in wrd report => ", error);
            res.status(500).json({ errorMsg: error.message, success: false });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  };