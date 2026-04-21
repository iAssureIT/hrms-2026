const cron = require("node-cron");
const axios = require("axios");
const moment = require("moment");

// Function to trigger accrual
const triggerAccrual = async () => {
    try {
        console.log(`[CRON] Starting Monthly Leave Accrual at ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
        // We call the API endpoint we just created
        // Use the configured port for internal calls
        const response = await axios.post("http://localhost:3050/api/leave-ledger/accrue-monthly");
        console.log(`[CRON] Accrual Result:`, response.data);
    } catch (error) {
        console.error(`[CRON] Error in Monthly Accrual:`, error.message);
    }
};

// Schedule: 1st of every month at 00:00
// Seconds Minutes Hours DayOfMonth Month DayOfWeek
cron.schedule("0 0 0 1 * *", () => {
    triggerAccrual();
});

console.log("[CRON] Leave Accrual Worker Initialized (Scheduled for 1st of each month)");

module.exports = { triggerAccrual };
