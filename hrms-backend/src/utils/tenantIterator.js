const { getCompanyRegistry } = require('../models/global');
const { getTenantConnection } = require('../config/database.config');

/**
 * Iterate active tenant databases. Never query the default mongoose
 * connection for tenant collections.
 */
async function forEachActiveTenant(jobName, handler) {
  const CompanyRegistry = await getCompanyRegistry();
  const companies = await CompanyRegistry.find({
    status: 'active',
    databaseStatus: 'active'
  }).select('companyId companyName tenantDatabaseName');

  let success = 0;
  let failed = 0;

  for (const company of companies) {
    try {
      const connection = await getTenantConnection(company.tenantDatabaseName || company.companyId);
      await handler({
        companyId: company.companyId,
        companyName: company.companyName,
        tenantDatabaseName: company.tenantDatabaseName,
        connection
      });
      success += 1;
    } catch (error) {
      failed += 1;
      console.error(`[cron:${jobName}] tenant=${company.companyId} failed: ${error.message}`);
    }
  }

  console.log(`[cron:${jobName}] tenants=${companies.length} success=${success} failed=${failed}`);
  return { total: companies.length, success, failed };
}

module.exports = { forEachActiveTenant };
