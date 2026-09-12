const cron = require('node-cron');
const leaveAccrualService = require('../services/leaveAccrualService');
const { forEachActiveTenant } = require('./tenantIterator');

const processMonthlyAccrual = cron.schedule('0 2 1 * *', async () => {
  try {
    console.log('[cron:leave-accrual-monthly] start');
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    await forEachActiveTenant('leave-accrual-monthly', async ({ companyId, companyName }) => {
      const result = await leaveAccrualService.processMonthlyAccrual(companyId, month, year);
      console.log(`[cron:leave-accrual-monthly] ${companyName}: ${result.message || 'ok'}`);
    });
  } catch (error) {
    console.error('[cron:leave-accrual-monthly] failed:', error.message);
  }
}, { scheduled: false });

const processYearlyAccrual = cron.schedule('0 3 1 1 *', async () => {
  try {
    console.log('[cron:leave-accrual-yearly] start');
    const year = new Date().getFullYear();
    await forEachActiveTenant('leave-accrual-yearly', async ({ companyId, companyName }) => {
      const result = await leaveAccrualService.processYearlyAccrual(companyId, year);
      console.log(`[cron:leave-accrual-yearly] ${companyName}: ${result.message || 'ok'}`);
    });
  } catch (error) {
    console.error('[cron:leave-accrual-yearly] failed:', error.message);
  }
}, { scheduled: false });

const processCarryForward = cron.schedule('0 4 1 1 *', async () => {
  try {
    console.log('[cron:leave-carry-forward] start');
    const currentDate = new Date();
    const fromYear = currentDate.getFullYear() - 1;
    const toYear = currentDate.getFullYear();
    await forEachActiveTenant('leave-carry-forward', async ({ companyId, companyName }) => {
      const result = await leaveAccrualService.processCarryForward(companyId, fromYear, toYear);
      console.log(`[cron:leave-carry-forward] ${companyName}: ${result.message || 'ok'}`);
    });
  } catch (error) {
    console.error('[cron:leave-carry-forward] failed:', error.message);
  }
}, { scheduled: false });

const processCarryForwardExpiry = cron.schedule('0 5 1 * *', async () => {
  try {
    console.log('[cron:leave-carry-forward-expiry] start');
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    await forEachActiveTenant('leave-carry-forward-expiry', async ({ companyId, companyName }) => {
      const result = await leaveAccrualService.processCarryForwardExpiry(companyId, year, month);
      if (result.data?.lapsed > 0) {
        console.log(`[cron:leave-carry-forward-expiry] ${companyName}: lapsed=${result.data.lapsed}`);
      }
    });
  } catch (error) {
    console.error('[cron:leave-carry-forward-expiry] failed:', error.message);
  }
}, { scheduled: false });

const startAccrualJobs = () => {
  processMonthlyAccrual.start();
  processYearlyAccrual.start();
  processCarryForward.start();
  processCarryForwardExpiry.start();
  console.log('✅ Leave accrual cron jobs started');
};

const stopAccrualJobs = () => {
  processMonthlyAccrual.stop();
  processYearlyAccrual.stop();
  processCarryForward.stop();
  processCarryForwardExpiry.stop();
  console.log('⏹️  Leave accrual cron jobs stopped');
};

module.exports = {
  startAccrualJobs,
  stopAccrualJobs,
  processMonthlyAccrual,
  processYearlyAccrual,
  processCarryForward,
  processCarryForwardExpiry
};
