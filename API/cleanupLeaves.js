const mongoose = require('mongoose');
const conn = mongoose.createConnection('mongodb://127.0.0.1/hrms2026');
const Schema = mongoose.Schema;

const LeaveApp = conn.model('leaveapplications', new Schema({}, {strict: false}));
const LeaveBal = conn.model('leavebalances', new Schema({}, {strict: false}));
const LeaveLedger = conn.model('leaveledgers', new Schema({}, {strict: false}));
const Employee = conn.model('employees', new Schema({}, {strict: false}));
const LeaveType = conn.model('leavetypes', new Schema({}, {strict: false}));

async function run() {
    try {
        console.log('Starting cleanup...');
        await LeaveApp.deleteMany({});
        await LeaveBal.deleteMany({});
        await LeaveLedger.deleteMany({});
        console.log('Cleanup complete.');

        const employees = await Employee.find();
        const leaveTypes = await LeaveType.find({ leaveCode: { $ne: 'LOP' } });
        
        console.log(`Found ${employees.length} employees and ${leaveTypes.length} leave types.`);
        
        let count = 0;
        const year = 2026;
        
        for (let emp of employees) {
            for (let type of leaveTypes) {
                await LeaveBal.create({
                    employeeId: emp._id,
                    leaveTypeId: type._id,
                    year,
                    openingBalance: 0,
                    remainingBalance: 0,
                    earnedDays: 0,
                    usedDays: 0,
                    createdAt: new Date()
                });

                await LeaveLedger.create({
                    employeeId: emp._id,
                    leaveTypeId: type._id,
                    year,
                    transactionType: 'OPENING',
                    transactionDate: new Date(),
                    days: 0,
                    balanceAfter: 0,
                    remarks: 'Yearly balance initialization (Starting with 0)',
                    referenceType: 'SYSTEM'
                });
                count++;
            }
        }
        console.log('Initialization complete. Records created:', count);
        process.exit(0);
    } catch (err) {
        console.error('Error during cleanup/init:', err);
        process.exit(1);
    }
}

run();
