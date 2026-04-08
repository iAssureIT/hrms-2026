const mongoose = require("mongoose");
const Asset = require("../assetManagementnew/model.js");
const { Types: { ObjectId } } = mongoose;

exports.getAssetFinancialReport = async (req, res) => {
    try {
        const {
            center_ID,
            category_id,
            year,
            pageNumber = 1,
            recsPerPage = 10,
            searchText = "-",
            removePagination = false
        } = req.body;

        const query = {
            assetStatus: { $nin: ["ASSET_APPROVAL_PENDING", "ASSET_APPROVAL_REJECTED"] }
        };

        if (center_ID && center_ID !== "all") {
            query["currentAllocation.center._id"] = new ObjectId(center_ID);
        }

        if (category_id && category_id !== "all") {
            query.category_id = new ObjectId(category_id);
        }

        if (searchText !== "-") {
            const searchRegex = new RegExp(searchText, "i");
            query.$or = [
                { assetID: searchRegex },
                { assetName: searchRegex },
                { category: searchRegex }
            ];
        }

        // Fetch assets
        const assets = await Asset.find(query).lean();

        const reportData = assets.map(asset => {
            const cost = asset.purchaseCost || 0;
            const life = asset.usefulLife || 1; 
            const residual = asset.residualValue || 0;
            const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : new Date();
            const today = new Date();

            // Precise calculation based on months/years
            const diffTime = Math.max(0, today - purchaseDate);
            const yearsPassed = diffTime / (1000 * 60 * 60 * 24 * 365);
            
            // SLM Depreciation
            const totalDepreciableAmount = cost - residual;
            const annualDepr = totalDepreciableAmount / life;
            
            let accDepr = annualDepr * yearsPassed;
            if (accDepr > totalDepreciableAmount) accDepr = totalDepreciableAmount;
            if (accDepr < 0) accDepr = 0;

            const nbv = cost - accDepr;
            const currentPeriodCharge = yearsPassed < life ? annualDepr : 0;

            return {
                _id: asset._id,
                assetID: asset.assetID,
                assetName: asset.assetName,
                category: asset.category,
                purchaseCost: cost,
                usefulLife: life,
                annualDepr: annualDepr,
                accumulatedDepr: accDepr,
                netBookValue: nbv,
                currentPeriodCharge: currentPeriodCharge,
                purchaseDate: asset.purchaseDate,
                residualValue: residual
            };
        });

        // Totals for Metric Cards
        const totals = reportData.reduce((acc, curr) => {
            acc.totalGrossBlock += curr.purchaseCost;
            acc.totalAccDepr += curr.accumulatedDepr;
            acc.totalNBV += curr.netBookValue;
            acc.totalCurrentCharge += curr.currentPeriodCharge;
            return acc;
        }, {
            totalGrossBlock: 0,
            totalAccDepr: 0,
            totalNBV: 0,
            totalCurrentCharge: 0
        });

        // Enhanced Forecast: Dynamic calculation for each predicted year
        const forecast = [];
        const currentYear = new Date().getFullYear();
        
        for (let i = 0; i <= 5; i++) {
            const fYear = currentYear + i;
            let totalNBVAtYear = 0;
            
            reportData.forEach(asset => {
                const assetPurchaseYear = asset.purchaseDate ? new Date(asset.purchaseDate).getFullYear() : currentYear;
                const yearsAtForecast = fYear - assetPurchaseYear;
                
                if (yearsAtForecast <= 0) {
                    totalNBVAtYear += asset.purchaseCost;
                } else if (yearsAtForecast >= asset.usefulLife) {
                    totalNBVAtYear += asset.residualValue;
                } else {
                    const deprAtYear = asset.annualDepr * yearsAtForecast;
                    totalNBVAtYear += (asset.purchaseCost - deprAtYear);
                }
            });

            forecast.push({
                year: `FY ${fYear}-${(fYear+1).toString().slice(-2)}`,
                netBookValue: Math.round(totalNBVAtYear)
            });
        }

        // Pagination
        const totalRecs = reportData.length;
        let pagedData = reportData;
        if (!removePagination) {
            pagedData = reportData.slice((pageNumber - 1) * recsPerPage, pageNumber * recsPerPage);
        }

        // Add summary row at the end if paged
        if (pagedData.length > 0) {
            pagedData.push({
                assetID: "Total",
                assetName: "-",
                category: "-",
                purchaseCost: totals.totalGrossBlock,
                usefulLife: "-",
                annualDepr: "-",
                accumulatedDepr: totals.totalAccDepr,
                netBookValue: totals.totalNBV,
                currentPeriodCharge: totals.totalCurrentCharge
            });
        }

        res.status(200).json({
            success: true,
            tableData: pagedData,
            totalRecs: totalRecs,
            metrics: totals,
            forecast: forecast
        });

    } catch (error) {
        console.error("Asset Financial Report Error:", error);
        res.status(500).json({ error: error.message, success: false });
    }
};
