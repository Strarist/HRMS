/**
 * One-shot repair: offboarded candidates stuck on stage "applied" → "available"
 * Dedupes repeated Ex-Employee timeline entries.
 * Run: node scripts/fix-ex-employee-candidate-stages.js
 */
require('dotenv').config();
const dns = require('dns');
try { dns.setDefaultResultOrder('ipv4first'); } catch (_) {}

const {
  connectGlobalDB,
  getTenantConnection,
  closeAllTenantConnections,
  closeGlobalConnection,
} = require('../src/config/database.config');
const CompanyRegistrySchema = require('../src/models/global/CompanyRegistry');
const CandidateSchema = require('../src/models/Candidate').schema;

(async () => {
  try {
    const global = await connectGlobalDB();
    const Company = global.model('CompanyRegistry', CompanyRegistrySchema);
    const companies = await Company.find({}).select('companyId companyName');

    let fixedStages = 0;
    let fixedTimelines = 0;

    for (const company of companies) {
      const tenant = await getTenantConnection(company.companyId);
      const Candidate = tenant.models.Candidate
        || tenant.model('Candidate', CandidateSchema);

      const stageResult = await Candidate.updateMany(
        {
          isExEmployee: true,
          $or: [
            { stage: 'applied' },
            { stage: null },
            { stage: { $exists: false } },
          ],
        },
        { $set: { stage: 'available' } }
      );
      fixedStages += stageResult.modifiedCount || 0;

      const exCandidates = await Candidate.find({ isExEmployee: true }).select('timeline');
      for (const c of exCandidates) {
        if (!Array.isArray(c.timeline) || c.timeline.length < 2) continue;
        const seen = new Set();
        const deduped = [];
        for (const event of c.timeline) {
          const key = `${event?.action}|${event?.description || ''}`;
          if (
            (event?.action === 'Marked as Ex-Employee' || event?.action === 'Added from Offboarding') &&
            seen.has(key)
          ) {
            continue;
          }
          if (event?.action === 'Marked as Ex-Employee' || event?.action === 'Added from Offboarding') {
            seen.add(key);
          }
          deduped.push(event);
        }
        if (deduped.length !== c.timeline.length) {
          c.timeline = deduped;
          await c.save();
          fixedTimelines += 1;
        }
      }

      console.log(`✅ ${company.companyName}: stages→${stageResult.modifiedCount || 0}`);
    }

    console.log(`Done. Stages fixed: ${fixedStages}, timelines cleaned: ${fixedTimelines}`);
    await closeAllTenantConnections();
    await closeGlobalConnection();
    process.exit(0);
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
})();
