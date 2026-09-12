/**
 * Comprehensive, Idempotent Seed Script for HRMS Development & Smoke Testing.
 * Seeds:
 * - SuperAdmin in global DB
 * - Primary Tenant A (SPC Management, slug: spc)
 * - Secondary Tenant B (Acme Corp, slug: acme) for cross-tenant isolation verification
 * - Users for all roles: company_admin, hr, manager, employee
 * - Departments, Employees, Leave Balances, Leave Requests, Announcements, Meetings, Jobs, Candidates, Projects
 *
 * Usage:
 *   ALLOW_SEED=1 node scripts/seed-all.js
 */
require('dotenv').config();
const dns = require('dns');
try { dns.setDefaultResultOrder('ipv4first'); } catch (_) {}

const { assertSafeToMutate } = require('../src/utils/scriptSafety');
assertSafeToMutate({ requireAllowFlag: true, allowFlag: 'ALLOW_SEED', label: 'seed-all.js' });

const mongoose = require('mongoose');
const {
  connectGlobalDB,
  getTenantConnection,
  closeAllTenantConnections,
  closeGlobalConnection,
} = require('../src/config/database.config');

const SuperAdminSchema = require('../src/models/global/SuperAdmin');
const CompanyRegistrySchema = require('../src/models/global/CompanyRegistry');
const TenantUserSchema = require('../src/models/tenant/TenantUser');
const TenantEmployeeSchema = require('../src/models/tenant/TenantEmployee');
const DepartmentSchema = require('../src/models/Department').schema;
const LeaveBalanceSchema = require('../src/models/tenant/LeaveBalance');
const LeaveRequestSchema = require('../src/models/tenant/LeaveRequest');
const AnnouncementSchema = require('../src/models/tenant/Announcement');
const TeamMeeting = require('../src/models/TeamMeeting');
const JobPosting = require('../src/models/JobPosting');
const Candidate = require('../src/models/Candidate');
const { getTenantModel } = require('../src/utils/tenantModels');

const SEED_CREDENTIALS = {
  superAdmin: { email: 'superadmin@hrms.com', password: 'SuperAdmin@2025' },
  spc: {
    admin: { email: 'admin@spc.com', password: 'SpcAdmin@2025', role: 'company_admin', firstName: 'Priya', lastName: 'Sharma' },
    hr: { email: 'hr@spc.com', password: 'SpcHR@2025', role: 'hr', firstName: 'Neha', lastName: 'Kapoor' },
    manager: { email: 'manager@spc.com', password: 'SpcManager@2025', role: 'manager', firstName: 'Rohan', lastName: 'Mehta' },
    employee: { email: 'employee@spc.com', password: 'SpcEmployee@2025', role: 'employee', firstName: 'Aarav', lastName: 'Patel', employeeCode: 'SPC001', designation: 'Software Engineer', department: 'Engineering' },
    employee2: { email: 'john.doe@spc.com', password: 'SpcEmployee@2025', role: 'employee', firstName: 'John', lastName: 'Doe', employeeCode: 'SPC002', designation: 'Senior Consultant', department: 'Consulting' }
  },
  acme: {
    admin: { email: 'admin@acme.com', password: 'AcmeAdmin@2025', role: 'company_admin', firstName: 'Alice', lastName: 'Smith' },
    employee: { email: 'employee@acme.com', password: 'AcmeEmployee@2025', role: 'employee', firstName: 'Bob', lastName: 'Jones', employeeCode: 'ACM001', designation: 'Analyst', department: 'Operations' }
  }
};

async function upsertTenantUser(User, data) {
  let user = await User.findOne({ email: data.email.toLowerCase() }).select('+password');
  if (user) {
    user.password = data.password;
    user.role = data.role;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.isActive = true;
    user.isFirstLogin = false;
    user.mustChangePassword = false;
    user.authProvider = 'local';
    if (data.department) user.department = data.department;
    if (data.designation) user.designation = data.designation;
    if (data.employeeCode) user.employeeCode = data.employeeCode;
    if (data.reportingManager) user.reportingManager = data.reportingManager;
    await user.save();
    return user;
  }
  user = new User({
    ...data,
    email: data.email.toLowerCase(),
    isActive: true,
    isFirstLogin: false,
    mustChangePassword: false,
    authProvider: 'local',
  });
  await user.save();
  return user;
}

async function seedCompany(globalConn, companyData) {
  const Company = globalConn.model('CompanyRegistry', CompanyRegistrySchema);
  let company = await Company.findOne({
    $or: [{ companyId: companyData.companyId }, { companySlug: companyData.companySlug }]
  });

  if (!company) {
    company = await Company.create({
      companyCode: companyData.companyCode,
      companyId: companyData.companyId,
      companyName: companyData.companyName,
      companySlug: companyData.companySlug,
      tenantDatabaseName: `tenant_${companyData.companyId}`,
      email: companyData.email,
      phone: companyData.phone || '+1-555-0199',
      companyAdmin: {
        email: companyData.adminEmail,
        firstName: companyData.adminFirstName || 'Admin',
        lastName: companyData.adminLastName || 'User'
      },
      isActive: true,
      subscriptionPlan: 'enterprise',
      status: 'active'
    });
    console.log(`✅ Created company: ${company.companyName} (${company.companyId})`);
  } else {
    company.companyName = companyData.companyName;
    company.companyCode = companyData.companyCode || company.companyCode;
    company.isActive = true;
    company.status = 'active';
    await company.save();
    console.log(`ℹ️ Updated existing company: ${company.companyName} (${company.companyId})`);
  }
  return company;
}

async function seedTenantData(companyId, credsList, isPrimary = false) {
  const tenant = await getTenantConnection(companyId);
  const TenantUser = tenant.model('User', TenantUserSchema);
  const TenantEmployee = tenant.model('Employee', TenantEmployeeSchema);
  const Department = tenant.models.Department || tenant.model('Department', DepartmentSchema);
  const LeaveBalance = tenant.models.LeaveBalance || tenant.model('LeaveBalance', LeaveBalanceSchema);
  const LeaveRequest = tenant.models.LeaveRequest || tenant.model('LeaveRequest', LeaveRequestSchema);
  const Announcement = tenant.models.Announcement || tenant.model('Announcement', AnnouncementSchema);
  const TeamMeetingModel = getTenantModel(tenant, 'TeamMeeting', TeamMeeting.schema);
  const JobModel = getTenantModel(tenant, 'JobPosting', JobPosting.schema);
  const CandidateModel = getTenantModel(tenant, 'Candidate', Candidate.schema);

  // 1. Departments
  const deptDocs = {};
  const deptNames = ['Engineering', 'Consulting', 'Human Resources', 'Finance', 'Operations'];
  for (const name of deptNames) {
    let dept = await Department.findOne({ name });
    if (!dept) {
      dept = await Department.create({
        name,
        code: name.slice(0, 3).toUpperCase(),
        description: `${name} Department`,
        isActive: true
      });
    }
    deptDocs[name] = dept;
  }
  console.log(`  📁 Departments verified (${Object.keys(deptDocs).length})`);

  // 2. Users
  const userDocs = {};
  for (const [key, userData] of Object.entries(credsList)) {
    const user = await upsertTenantUser(TenantUser, {
      ...userData,
      reportingManager: userData.role === 'employee' ? credsList.manager?.email : undefined
    });
    userDocs[key] = user;

    // Upsert Employee profile for non-admin users
    let emp = await TenantEmployee.findOne({ email: user.email });
    if (!emp) {
      emp = await TenantEmployee.create({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        employeeCode: user.employeeCode || `EMP${user._id.toString().slice(-4)}`,
        designation: user.designation || (user.role === 'manager' ? 'Team Lead' : 'Staff'),
        department: deptDocs[user.department]?.name || 'Engineering',
        joiningDate: new Date('2024-01-15'),
        status: 'active',
        employmentType: 'full-time',
        reportingManager: user.reportingManager || null,
        user: user._id
      });
    }
    user.employeeId = emp._id;
    await user.save();
  }
  console.log(`  👤 Users seeded (${Object.keys(userDocs).length})`);

  if (isPrimary) {
    const currentYear = new Date().getFullYear();
    const primaryEmployee = userDocs.employee;
    const primaryManager = userDocs.manager;

    // 3. Leave Balances for employee
    if (primaryEmployee) {
      const leaveTypes = ['Casual Leave', 'Sick Leave', 'Personal Leave'];
      for (const lt of leaveTypes) {
        const existingLb = await LeaveBalance.findOne({
          employeeEmail: primaryEmployee.email,
          leaveType: lt,
          year: currentYear
        });
        if (!existingLb) {
          await LeaveBalance.create({
            employeeId: primaryEmployee._id,
            employeeEmail: primaryEmployee.email,
            leaveType: lt,
            year: currentYear,
            totalAllocated: 12,
            available: 10,
            consumed: 2,
            pending: 0
          });
        }
      }
      console.log(`  🏖️ Leave balances verified`);

      // 4. Sample Leave Request
      const existingLr = await LeaveRequest.findOne({ employeeEmail: primaryEmployee.email });
      if (!existingLr) {
        await LeaveRequest.create({
          employeeId: primaryEmployee._id,
          employeeEmail: primaryEmployee.email,
          employeeName: `${primaryEmployee.firstName} ${primaryEmployee.lastName}`,
          leaveType: 'Casual Leave',
          startDate: new Date(Date.now() + 86400000 * 3),
          endDate: new Date(Date.now() + 86400000 * 4),
          numberOfDays: 2,
          reason: 'Personal family event',
          status: 'pending',
          reportingManager: primaryManager?.email || 'manager@spc.com'
        });
        console.log(`  📝 Sample leave request created`);
      }
    }

    // 5. Announcements
    const existingAnn = await Announcement.findOne({ title: 'Welcome to HRMS 2026' });
    if (!existingAnn && userDocs.admin) {
      await Announcement.create({
        title: 'Welcome to HRMS 2026',
        message: 'Welcome to our company portal. Please verify your profile and explore team resources.',
        priority: 'high',
        targetAudience: 'all',
        createdBy: userDocs.admin._id,
        createdByEmail: userDocs.admin.email,
        createdByName: `${userDocs.admin.firstName} ${userDocs.admin.lastName}`,
        isActive: true
      });
      console.log(`  📢 Announcements seeded`);
    }

    // 6. Team Meeting
    if (primaryManager && primaryEmployee) {
      const existingMeet = await TeamMeetingModel.findOne({ title: 'Weekly Engineering Sync' });
      if (!existingMeet) {
        await TeamMeetingModel.create({
          title: 'Weekly Engineering Sync',
          description: 'Regular sprint alignment and blocker review',
          meetingDate: new Date().toISOString().split('T')[0],
          startTime: '11:00 AM',
          startDateTime: new Date(),
          duration: 45,
          meetingType: 'online',
          meetingLink: 'https://meet.google.com/spc-eng-sync',
          attendees: [primaryManager._id, primaryEmployee._id],
          createdBy: primaryManager._id,
          status: 'scheduled'
        });
        console.log(`  📅 Team meetings seeded`);
      }
    }

    // 7. Sample Job Posting
    let job = await JobModel.findOne({ title: 'Full Stack Node / React Developer' });
    if (!job) {
      job = await JobModel.create({
        title: 'Full Stack Node / React Developer',
        department: deptDocs['Engineering']?._id,
        location: 'Bengaluru / Remote',
        employmentType: 'full-time',
        description: 'Build enterprise HRMS multi-tenant platforms',
        status: 'active',
        openings: 2,
        createdBy: userDocs.admin?._id
      });
      console.log(`  💼 Sample Job Posting seeded`);
    }

    // 8. Sample Candidates
    const sampleCandidates = [
      { candidateCode: 'CAN001', firstName: 'Karan', lastName: 'Malhotra', email: 'karan.malhotra@test.com', phone: '9876543210', stage: 'screening', status: 'active' },
      { candidateCode: 'CAN002', firstName: 'Pooja', lastName: 'Bansal', email: 'pooja.bansal@test.com', phone: '9876543211', stage: 'interview-scheduled', status: 'active' },
      { candidateCode: 'CAN003', firstName: 'Sameer', lastName: 'Nair', email: 'sameer.nair@test.com', phone: '9876543212', stage: 'offer-extended', status: 'active' },
      { candidateCode: 'CAN004', firstName: 'Ritu', lastName: 'Sen', email: 'ritu.sen@test.com', phone: '9876543213', stage: 'available', isExEmployee: true, exEmployeeCode: 'SPC099', status: 'active' }
    ];

    for (const cand of sampleCandidates) {
      const exists = await CandidateModel.findOne({ email: cand.email });
      if (!exists) {
        await CandidateModel.create({
          ...cand,
          appliedFor: job?._id,
          skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
          currentDesignation: 'Developer',
          experience: 4
        });
      }
    }
    console.log(`  🎯 Candidates seeded (${sampleCandidates.length})`);
  }
}

async function main() {
  console.log('🚀 Starting idempotent seed-all...');
  const globalConn = await connectGlobalDB();
  if (!globalConn) throw new Error('Global DB connection failed');

  // Seed SuperAdmin
  const SuperAdmin = globalConn.model('SuperAdmin', SuperAdminSchema);
  let sa = await SuperAdmin.findOne({ email: SEED_CREDENTIALS.superAdmin.email }).select('+password');
  if (!sa) {
    sa = new SuperAdmin({
      email: SEED_CREDENTIALS.superAdmin.email,
      password: SEED_CREDENTIALS.superAdmin.password,
      firstName: 'Super',
      lastName: 'Administrator',
      role: 'superadmin',
      isActive: true
    });
    await sa.save();
    console.log(`✅ SuperAdmin created: ${sa.email}`);
  } else {
    sa.password = SEED_CREDENTIALS.superAdmin.password;
    sa.isActive = true;
    await sa.save();
    console.log(`ℹ️ SuperAdmin verified: ${sa.email}`);
  }

  // Seed Primary Company A (matches VITE_PUBLIC_COMPANY_ID)
  const spcCompanyId = process.env.PUBLIC_COMPANY_ID || '696b515db6c9fd5fd51aed1c';
  await seedCompany(globalConn, {
    companyCode: 'SPC',
    companyId: spcCompanyId,
    companyName: 'SPC Management Consulting',
    companySlug: 'spc',
    email: 'contact@spc.com',
    phone: '+91-9876543210',
    adminEmail: SEED_CREDENTIALS.spc.admin.email,
    adminFirstName: SEED_CREDENTIALS.spc.admin.firstName,
    adminLastName: SEED_CREDENTIALS.spc.admin.lastName
  });
  console.log(`🌱 Seeding Tenant A (${spcCompanyId})...`);
  await seedTenantData(spcCompanyId, SEED_CREDENTIALS.spc, true);

  // Seed Secondary Company B for tenant isolation testing
  const acmeCompanyId = '654321000000000000000002';
  await seedCompany(globalConn, {
    companyCode: 'ACM',
    companyId: acmeCompanyId,
    companyName: 'Acme Corporation',
    companySlug: 'acme',
    email: 'contact@acme.com',
    phone: '+1-555-0144',
    adminEmail: SEED_CREDENTIALS.acme.admin.email,
    adminFirstName: SEED_CREDENTIALS.acme.admin.firstName,
    adminLastName: SEED_CREDENTIALS.acme.admin.lastName
  });
  console.log(`🌱 Seeding Tenant B (${acmeCompanyId})...`);
  await seedTenantData(acmeCompanyId, SEED_CREDENTIALS.acme, false);

  console.log('🎉 Idempotent seed-all finished successfully!');
  await closeAllTenantConnections();
  await closeGlobalConnection();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('❌ seed-all failed:', err);
  try {
    await closeAllTenantConnections();
    await closeGlobalConnection();
  } catch (_) {}
  process.exit(1);
});
