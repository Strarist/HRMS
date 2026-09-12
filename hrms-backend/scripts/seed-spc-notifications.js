/**
 * Seed realistic demo notifications for SPC Admin / HR / Manager / Employee.
 * Run: node scripts/seed-spc-notifications.js
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
const TenantUserSchema = require('../src/models/tenant/TenantUser');
const NotificationSchema = require('../src/models/Notification').schema;

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

/** Role-specific realistic inbox items */
const SAMPLES_BY_ROLE = {
  company_admin: [
    {
      type: 'leave-request',
      title: 'Leave escalation: Riya Sharma',
      message: 'Annual leave (3 days) pending manager approval for over 48 hours.',
      priority: 'high',
      createdAt: hoursAgo(5),
    },
    {
      type: 'compliance-due',
      title: 'PF filing due this week',
      message: 'Monthly EPF contribution remittance for March closes on Friday.',
      priority: 'urgent',
      createdAt: hoursAgo(2),
    },
    {
      type: 'payroll',
      title: 'Payroll cycle unlocked',
      message: 'March payroll is ready for review. 42 employees pending confirmation.',
      priority: 'high',
      createdAt: daysAgo(1),
    },
    {
      type: 'contract-expiry',
      title: 'Vendor MSA renewals',
      message: 'Two consultant MSAs with Apex Staffing expire in 21 days.',
      priority: 'medium',
      createdAt: daysAgo(2),
    },
    {
      type: 'general',
      title: 'Workspace health check',
      message: 'All SPC modules are active. Last backup completed successfully at 02:15 IST.',
      priority: 'low',
      createdAt: daysAgo(3),
      isRead: true,
    },
  ],
  hr: [
    {
      type: 'document-expiry',
      title: 'Aadhaar KYC expiring — Karan Mehta',
      message: 'Employee SPC-1048 identity verification expires in 9 days. Request re-upload.',
      priority: 'urgent',
      createdAt: hoursAgo(1),
    },
    {
      type: 'leave-request',
      title: 'New leave request: Ananya Iyer',
      message: 'Sick leave for 12–13 Mar. Supporting medical note attached.',
      priority: 'high',
      createdAt: hoursAgo(3),
    },
    {
      type: 'feedback-request',
      title: 'Probation review due',
      message: 'Vikram Patel completes probation on 28 Mar. Manager feedback still pending.',
      priority: 'high',
      createdAt: hoursAgo(8),
    },
    {
      type: 'project-assignment',
      title: 'Onboarding pack: Priya Nair',
      message: 'Offer accepted for Senior Analyst. Start date 1 Apr — docs checklist at 60%.',
      priority: 'medium',
      createdAt: daysAgo(1),
    },
    {
      type: 'exit-clearance',
      title: 'Exit clearance incomplete',
      message: 'Rohit Desai’s last working day is Friday. IT asset return still open.',
      priority: 'urgent',
      createdAt: daysAgo(1),
    },
    {
      type: 'general',
      title: 'Holiday calendar published',
      message: 'FY 2026–27 holiday list is live for all employees under SPC Management.',
      priority: 'low',
      createdAt: daysAgo(4),
      isRead: true,
    },
  ],
  manager: [
    {
      type: 'leave-request',
      title: 'Team leave: Sneha Kulkarni',
      message: 'Casual leave requested for 18 Mar. Coverage suggested: Arjun Reddy.',
      priority: 'high',
      createdAt: hoursAgo(2),
    },
    {
      type: 'timesheet-approval',
      title: 'Timesheets awaiting approval',
      message: '4 team timesheets for week ending 8 Mar need your sign-off.',
      priority: 'medium',
      createdAt: hoursAgo(6),
    },
    {
      type: 'project-assignment',
      title: 'Resource request approved',
      message: 'You have been assigned as delivery lead for Phoenix Migration (Phase 2).',
      priority: 'high',
      createdAt: daysAgo(1),
    },
    {
      type: 'feedback-request',
      title: '360° feedback reminder',
      message: 'Please submit peer feedback for Divya Krishnan by Friday EOD.',
      priority: 'medium',
      createdAt: daysAgo(2),
    },
    {
      type: 'general',
      title: 'Stand-up notes shared',
      message: 'Yesterday’s sprint board update is available in Project Phoenix.',
      priority: 'low',
      createdAt: daysAgo(3),
      isRead: true,
    },
  ],
  employee: [
    {
      type: 'payroll',
      title: 'Payslip available',
      message: 'Your February payslip is ready to download from My Payroll.',
      priority: 'medium',
      createdAt: hoursAgo(4),
    },
    {
      type: 'leave-request',
      title: 'Leave approved',
      message: 'Your casual leave on 5 Mar was approved by your manager.',
      priority: 'low',
      createdAt: daysAgo(1),
      isRead: true,
    },
    {
      type: 'document-expiry',
      title: 'Update your PAN details',
      message: 'HR requested an updated PAN scan for tax compliance. Due in 7 days.',
      priority: 'high',
      createdAt: hoursAgo(12),
    },
    {
      type: 'project-assignment',
      title: 'Added to Project Nova',
      message: 'You have been added as a contributor. Kick-off call is Monday 11:00 IST.',
      priority: 'medium',
      createdAt: daysAgo(2),
    },
    {
      type: 'general',
      title: 'Policy update: WFH guidelines',
      message: 'Updated remote-work policy is effective from 1 Apr. Please acknowledge in HR portal.',
      priority: 'low',
      createdAt: daysAgo(5),
    },
  ],
};

(async () => {
  try {
    const global = await connectGlobalDB();
    const Company = global.model('CompanyRegistry', CompanyRegistrySchema);
    const company =
      (await Company.findOne({ companyName: /SPC/i })) ||
      (await Company.findOne({}).sort({ createdAt: -1 }));

    if (!company) throw new Error('No company found — seed SPC company first');

    const tenant = await getTenantConnection(company.companyId);
    const User = tenant.model('User', TenantUserSchema);
    const Notification = tenant.model('Notification', NotificationSchema);

    const targets = await User.find({
      role: { $in: ['company_admin', 'hr', 'manager', 'employee'] },
      isActive: { $ne: false },
    })
      .select('_id email role firstName lastName')
      .limit(40);

    if (!targets.length) {
      throw new Error('No tenant users found to attach notifications');
    }

    await Notification.deleteMany({});

    let created = 0;
    for (const user of targets) {
      const roleKey = String(user.role || '').toLowerCase();
      const samples = SAMPLES_BY_ROLE[roleKey] || SAMPLES_BY_ROLE.employee;

      for (const sample of samples) {
        const { createdAt, isRead, ...rest } = sample;
        const stamp = createdAt || new Date();
        const doc = await Notification.create({
          recipient: user._id,
          ...rest,
          isRead: Boolean(isRead),
          readAt: isRead ? stamp : undefined,
          isActive: true,
        });
        await Notification.updateOne(
          { _id: doc._id },
          { $set: { createdAt: stamp, updatedAt: stamp } }
        );
        created += 1;
      }
    }

    console.log(`✅ Created ${created} notifications for ${targets.length} users @ ${company.companyName}`);
    console.log(
      '   Roles covered:',
      [...new Set(targets.map((u) => u.role))].join(', ')
    );
    await closeAllTenantConnections();
    await closeGlobalConnection();
    process.exit(0);
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
})();
