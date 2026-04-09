const mongoose = require('mongoose');
const moment = require('moment');

async function runSync() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1/hrms2026');
    console.log('Connected.');

    const Employee = mongoose.model('Employees', new mongoose.Schema({}, { strict: false }));
    const LeaveType = mongoose.model('leavetypes', new mongoose.Schema({}, { strict: false }));
    const LeaveBalance = mongoose.model('leavebalances', new mongoose.Schema({}, { strict: false }));
    const LeaveLedger = mongoose.model('leaveledgers', new mongoose.Schema({}, { strict: false }));

    const year = 2026;
    const emps = await Employee.find();
    const types = await LeaveType.find({ leaveCode: { $ne: 'LOP' } });

    console.log(`Found ${emps.length} employees and ${types.length} leave types.`);

    let createdCount = 0;

    for (let emp of emps) {
      console.log(`Checking employee: ${emp.employeeName} (${emp._id})`);
      for (let type of types) {
        const exists = await LeaveBalance.findOne({
          employeeId: emp._id,
          leaveTypeId: type._id,
          year: year
        });

        if (!exists) {
          console.log(`Creating balance/ledger for ${type.leaveCode}...`);
          await LeaveBalance.create({
            employeeId: emp._id,
            leaveTypeId: type._id,
            year: year,
            openingBalance: type.maxDaysPerYear || 0,
            remainingBalance: type.maxDaysPerYear || 0,
            earnedDays: 0,
            usedDays: 0
          });

          await LeaveLedger.create({
            employeeId: emp._id,
            leaveTypeId: type._id,
            year: year,
            transactionType: 'OPENING',
            days: type.maxDaysPerYear || 0,
            balanceAfter: type.maxDaysPerYear || 0,
            remarks: 'Yearly balance initialization (Sync script)'
          });
          createdCount++;
        } else {
          console.log(`Balance for ${type.leaveCode} already exists.`);
        }
      }
    }

    console.log(`Sync completed. Created ${createdCount} entries.`);
    process.exit(0);
  } catch (err) {
    console.error('ERROR DURING SYNC:', err);
    process.exit(1);
  }
}

runSync();
