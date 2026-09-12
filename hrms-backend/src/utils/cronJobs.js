const cron = require('node-cron');
const TenantUserSchema = require('../models/tenant/TenantUser');
const { forEachActiveTenant } = require('./tenantIterator');
const { getTenantModel } = require('./tenantModels');

function getUserModel(connection) {
  if (connection.models.User) return connection.models.User;
  return connection.model('User', TenantUserSchema);
}

async function notifyUser(Notification, User, employeeId, payload) {
  if (!employeeId) return;
  const user = await User.findOne({ employeeId });
  if (!user) return;
  await Notification.create({
    recipient: user._id,
    ...payload
  });
}

const checkExpiringDocuments = cron.schedule('0 9 * * *', async () => {
  try {
    console.log('[cron:expiring-documents] start');
    const today = new Date();
    await forEachActiveTenant('expiring-documents', async ({ connection, companyId }) => {
      const Document = getTenantModel(connection, 'Document');
      const Notification = getTenantModel(connection, 'Notification');
      const User = getUserModel(connection);
      if (!Document || !Notification || !User) return;

      const documents = await Document.find({
        expiryDate: { $exists: true, $ne: null },
        status: { $ne: 'expired' },
        isActive: true
      }).populate('employee');

      for (const doc of documents) {
        const daysUntilExpiry = Math.ceil((doc.expiryDate - today) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= (doc.alertDaysBefore || 30) && daysUntilExpiry > 0) {
          await notifyUser(Notification, User, doc.employee?._id || doc.employee, {
            type: 'document-expiry',
            title: 'Document Expiring Soon',
            message: `Your ${doc.documentType} (${doc.documentName}) will expire in ${daysUntilExpiry} days`,
            priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
            relatedEntity: { entityType: 'Document', entityId: doc._id },
            actionUrl: `/documents/${doc._id}`
          });
        } else if (daysUntilExpiry <= 0) {
          doc.status = 'expired';
          await doc.save();
        }
      }
      console.log(`[cron:expiring-documents] tenant=${companyId} scanned=${documents.length}`);
    });
  } catch (error) {
    console.error('[cron:expiring-documents] failed:', error.message);
  }
}, { scheduled: false });

const checkDueCompliances = cron.schedule('0 9 * * *', async () => {
  try {
    console.log('[cron:due-compliances] start');
    const today = new Date();
    await forEachActiveTenant('due-compliances', async ({ connection, companyId }) => {
      const Compliance = getTenantModel(connection, 'Compliance');
      const Notification = getTenantModel(connection, 'Notification');
      const User = getUserModel(connection);
      if (!Compliance || !Notification || !User) return;

      const compliances = await Compliance.find({
        dueDate: { $exists: true, $ne: null },
        status: { $in: ['pending', 'in-progress'] },
        alertEnabled: true,
        isActive: true
      }).populate('employee');

      for (const compliance of compliances) {
        const daysUntilDue = Math.ceil((compliance.dueDate - today) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= (compliance.alertDaysBefore || 7) && daysUntilDue >= 0) {
          await notifyUser(Notification, User, compliance.employee?._id || compliance.employee, {
            type: 'compliance-due',
            title: 'Compliance Due Soon',
            message: `${compliance.title} is due in ${daysUntilDue} days`,
            priority: daysUntilDue <= 5 ? 'urgent' : 'high',
            relatedEntity: { entityType: 'Compliance', entityId: compliance._id },
            actionUrl: `/compliance/${compliance._id}`
          });
        }
      }
      console.log(`[cron:due-compliances] tenant=${companyId} scanned=${compliances.length}`);
    });
  } catch (error) {
    console.error('[cron:due-compliances] failed:', error.message);
  }
}, { scheduled: false });

const checkExpiringContracts = cron.schedule('0 9 * * *', async () => {
  try {
    console.log('[cron:expiring-contracts] start');
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);

    await forEachActiveTenant('expiring-contracts', async ({ connection, companyId }) => {
      const Project = getTenantModel(connection, 'Project');
      const Notification = getTenantModel(connection, 'Notification');
      const User = getUserModel(connection);
      if (!Project || !Notification || !User) return;

      const projects = await Project.find({
        endDate: { $gte: today, $lte: futureDate },
        status: 'active'
      }).populate('projectManager');

      for (const project of projects) {
        const daysUntilExpiry = Math.ceil((project.endDate - today) / (1000 * 60 * 60 * 24));
        if (project.projectManager) {
          await notifyUser(Notification, User, project.projectManager._id || project.projectManager, {
            type: 'contract-expiry',
            title: 'Project Contract Expiring',
            message: `Project "${project.name}" contract expires in ${daysUntilExpiry} days`,
            priority: daysUntilExpiry <= 15 ? 'high' : 'medium',
            relatedEntity: { entityType: 'Project', entityId: project._id },
            actionUrl: `/projects/${project._id}`
          });
        }
      }
      console.log(`[cron:expiring-contracts] tenant=${companyId} scanned=${projects.length}`);
    });
  } catch (error) {
    console.error('[cron:expiring-contracts] failed:', error.message);
  }
}, { scheduled: false });

const checkApprovalSLAs = cron.schedule('0 */2 * * *', async () => {
  try {
    console.log('[cron:approval-sla] start');
    const approvalEngine = require('../services/approvalEngine');
    await forEachActiveTenant('approval-sla', async ({ connection, companyName }) => {
      const escalated = await approvalEngine.checkAndEscalateSLAs(connection);
      if (escalated.length > 0) {
        console.log(`[cron:approval-sla] ${companyName}: escalated ${escalated.length}`);
      }
    });
  } catch (error) {
    console.error('[cron:approval-sla] failed:', error.message);
  }
}, { scheduled: false });

const { startAccrualJobs } = require('./leaveAccrualJobs');
const contractRenewalService = require('../services/contractRenewalService');

const checkEmployeeContractRenewals = cron.schedule('0 9 * * *', async () => {
  try {
    console.log('[cron:contract-renewal] start');
    await forEachActiveTenant('contract-renewal', async ({ companyId, companyName }) => {
      const result = await contractRenewalService.checkContractRenewals(companyId);
      if (result.success && result.notificationsSent > 0) {
        console.log(`[cron:contract-renewal] ${companyName}: notifications=${result.notificationsSent}`);
      }
      const expiredResult = await contractRenewalService.updateExpiredContracts(companyId);
      if (expiredResult.success && expiredResult.updatedCount > 0) {
        console.log(`[cron:contract-renewal] ${companyName}: expired=${expiredResult.updatedCount}`);
      }
      const autoRenewResult = await contractRenewalService.processAutoRenewals(companyId);
      if (autoRenewResult.success && autoRenewResult.renewedCount > 0) {
        console.log(`[cron:contract-renewal] ${companyName}: renewed=${autoRenewResult.renewedCount}`);
      }
    });
  } catch (error) {
    console.error('[cron:contract-renewal] failed:', error.message);
  }
}, { scheduled: false });

const startCronJobs = () => {
  checkExpiringDocuments.start();
  checkDueCompliances.start();
  checkExpiringContracts.start();
  checkApprovalSLAs.start();
  checkEmployeeContractRenewals.start();
  startAccrualJobs();
  console.log('✅ Cron jobs started (tenant-aware)');
};

const { stopAccrualJobs } = require('./leaveAccrualJobs');

const stopCronJobs = () => {
  checkExpiringDocuments.stop();
  checkDueCompliances.stop();
  checkExpiringContracts.stop();
  checkApprovalSLAs.stop();
  checkEmployeeContractRenewals.stop();
  stopAccrualJobs();
  console.log('⏹️  Cron jobs stopped');
};

module.exports = {
  startCronJobs,
  stopCronJobs
};
