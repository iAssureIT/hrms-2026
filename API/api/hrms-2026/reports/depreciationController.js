const mongoose = require("mongoose");
const Asset = require("../assetManagementnew/model.js");
const moment = require("moment");
const AssetDepreciationMaster = require("../assetDepreciationMaster/model.js");

/**
 * GET Depreciation Report
 * Method: POST (to support filters)
 * URL: /api/reports/get/depreciation-report
 */
exports.getDepreciationReport = async (req, res) => {
    try {
        const { center_ID, category_id, pageNumber, recsPerPage, searchText } = req.body;

        const query = { 
            assetStatus: { $in: ["ACTIVE", "ALLOCATED", "MAINTENANCE"] } 
        };

        if (center_ID && center_ID !== "all") {
            query["currentAllocation.center._id"] = center_ID;
        }
        if (category_id && category_id !== "all") {
            query.category_id = category_id;
        }
        if (searchText && searchText !== "-") {
            query.$or = [
                { assetName: { $regex: searchText, $options: "i" } },
                { assetID: { $regex: searchText, $options: "i" } }
            ];
        }

        const skip = (parseInt(pageNumber) - 1) * parseInt(recsPerPage);
        const limit = parseInt(recsPerPage);

        // Fetching page data
        const assets = await Asset.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalRecsCount = await Asset.countDocuments(query);

        // Fetch Category Rates
        const allRates = await AssetDepreciationMaster.find().lean();
        const ratesMap = {};
        allRates.forEach(r => {
            ratesMap[r.dropdown_id.toString()] = r.inputValue / 100;
        });

        const today = moment();
        const GLOBAL_DEFAULT_RATE = 0.1; // 10% fallback

        const tableData = assets.map(asset => {
            const purchaseDate = moment(asset.purchaseDate);
            const originalCost = asset.purchaseCost || 0;
            const rate = asset.category_id && ratesMap[asset.category_id.toString()] !== undefined 
                         ? ratesMap[asset.category_id.toString()] 
                         : GLOBAL_DEFAULT_RATE;

            // 1. Calculate Full Years Passed
            const yearsPassed = today.diff(purchaseDate, 'years');
            
            // 2. WDV Calculation for Full Years
            let nbvAtYearStart = originalCost;
            for (let i = 0; i < yearsPassed; i++) {
                nbvAtYearStart = nbvAtYearStart * (1 - rate);
            }

            // 3. Day-wise Depreciation for the current anniversary year
            const anniversaryDate = moment(purchaseDate).add(yearsPassed, 'years');
            const daysInCurrentYear = today.diff(anniversaryDate, 'days');
            
            const annualDeprAmountThisYear = Math.round(nbvAtYearStart * rate);
            const currentPeriodDepr = Math.round((annualDeprAmountThisYear * daysInCurrentYear) / 365);
            
            const currentValue = Math.round(nbvAtYearStart - currentPeriodDepr);
            const totalAccDepr = Math.round(originalCost - currentValue);

            return {
                _id: asset._id,
                assetID: asset.assetID,
                assetName: asset.assetName,
                category: asset.category || "Uncategorized",
                originalCost: Math.round(originalCost),
                life: asset.usefulLife || "NA",
                annualDepr: annualDeprAmountThisYear,
                accDepr: totalAccDepr,
                netBookValue: currentValue, // This is the "Current Value"
                purchaseDate: purchaseDate.isValid() ? purchaseDate.format("DD-MMM-YYYY") : "-",
                appliedRatePercent: rate * 100
            };
        });

        // Metrics Calculation (for the entire filtered set)
        const allFilteredAssets = await Asset.find(query).select('purchaseCost purchaseDate category_id').lean();
        
        let totalOriginalCost = 0;
        let totalCurrentValue = 0;
        let totalAccDepr = 0;
        let totalCurrentPeriodDepr = 0;

        allFilteredAssets.forEach(asset => {
            const cost = asset.purchaseCost || 0;
            const pDate = moment(asset.purchaseDate);
            if(!pDate.isValid()) return;

            const rate = asset.category_id && ratesMap[asset.category_id.toString()] !== undefined 
                         ? ratesMap[asset.category_id.toString()] 
                         : GLOBAL_DEFAULT_RATE;

            const yPassed = today.diff(pDate, 'years');
            let nbv = cost;
            for (let i = 0; i < yPassed; i++) {
                nbv = nbv * (1 - rate);
            }
            const annivDate = moment(pDate).add(yPassed, 'years');
            const days = today.diff(annivDate, 'days');
            const currentPeriodD = (nbv * rate * days) / 365;
            const cv = nbv - currentPeriodD;

            totalOriginalCost += cost;
            totalCurrentValue += cv;
            totalAccDepr += (cost - cv);
            totalCurrentPeriodDepr += currentPeriodD;
        });

        const metrics = {
            totalOriginalCost: Math.round(totalOriginalCost),
            totalCurrentValue: Math.round(totalCurrentValue),
            totalAccDepr: Math.round(totalAccDepr),
            totalCurrentPeriodDepr: Math.round(totalCurrentPeriodDepr),
            deprMethod: "WDV (Reducing Balance)"
        };

        // Add TOTAL row at the end for the table
        if (tableData.length > 0) {
            tableData.push({
                assetID: "Total",
                assetName: "",
                category: "",
                originalCost: Math.round(totalOriginalCost),
                life: "",
                annualDepr: "",
                accDepr: Math.round(totalAccDepr),
                netBookValue: Math.round(totalCurrentValue)
            });
        }

        res.status(200).json({
            success: true,
            tableData: tableData,
            totalRecs: totalRecsCount,
            metrics: metrics
        });

    } catch (error) {
        console.error("getDepreciationReport Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

/**
 * GET Asset Depreciation Projection
 * URL: /api/reports/get/asset-projection/:assetID
 */
exports.getAssetProjection = async (req, res) => {
    try {
        const { assetID } = req.params;
        const asset = await Asset.findOne({ _id: assetID }).lean();
        if (!asset) {
            return res.status(404).json({ success: false, message: "Asset not found" });
        }

        const today = moment();
        
        // Fetch Category Rates
        const allRates = await AssetDepreciationMaster.find().lean();
        const ratesMap = {};
        allRates.forEach(r => {
            ratesMap[r.dropdown_id.toString()] = r.inputValue / 100;
        });

        const GLOBAL_DEFAULT_RATE = 0.1; 
        const rate = asset.category_id && ratesMap[asset.category_id.toString()] !== undefined 
                     ? ratesMap[asset.category_id.toString()] 
                     : GLOBAL_DEFAULT_RATE;

        const purchaseDate = moment(asset.purchaseDate);
        const originalCost = asset.purchaseCost || 0;

        // 1. Calculate Current NBV (Today)
        const yearsPassed = today.diff(purchaseDate, 'years');
        let currentNBV = originalCost;
        for (let i = 0; i < yearsPassed; i++) {
            currentNBV = currentNBV * (1 - rate);
        }
        const anniversaryDate = moment(purchaseDate).add(yearsPassed, 'years');
        const daysInCurrentYear = today.diff(anniversaryDate, 'days');
        const deprThisYearSoFar = Math.round((currentNBV * rate * daysInCurrentYear) / 365);
        const nbvToday = Math.round(currentNBV - deprThisYearSoFar);

        // 2. Projections for next 3 Financial Years (Ending March 31st)
        // Let's find the end of the current FY
        let currentFYEnd = moment().month() >= 3 ? moment().year() + 1 : moment().year();
        
        const projections = [];
        let projectionNBV = nbvToday;

        for (let i = 0; i < 3; i++) {
            const fyYear = currentFYEnd + i;
            const fyLabel = `FY ${fyYear-1}-${fyYear.toString().slice(-2)}`;
            
            const deprCharge = Math.round(projectionNBV * rate);
            const closingNBV = Math.round(projectionNBV - deprCharge);

            projections.push({
                financialYear: fyLabel,
                openingNBV: Math.round(projectionNBV),
                depreciation: deprCharge,
                closingNBV: closingNBV
            });

            projectionNBV = closingNBV;
        }

        res.status(200).json({
            success: true,
            assetData: {
                assetID: asset.assetID,
                assetName: asset.assetName,
                category: asset.category,
                subCategory: asset.subCategory,
                purchaseDate: purchaseDate.format("DD-MMM-YYYY"),
                originalCost: originalCost,
                center: asset.currentAllocation?.center?.name || "NA",
                department: asset.currentAllocation?.department?.name || "NA",
                currentValue: nbvToday,
                appliedRatePercent: rate * 100
            },
            projections: projections
        });

    } catch (error) {
        console.error("getAssetProjection Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
