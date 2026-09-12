/**
 * Shared team statistics from tenant data. Does not invent attendance.
 */
const LeaveRequestSchema = require('../models/tenant/LeaveRequest');
const TenantUserSchema = require('../models/tenant/TenantUser');
const { getTenantModel } = require('../utils/tenantModels');

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

async function getTeamStats(connection, managerEmail) {
  const TenantUser = connection.model('User', TenantUserSchema);
  const LeaveRequest = connection.model('LeaveRequest', LeaveRequestSchema);
  const Attendance = getTenantModel(connection, 'Attendance');
  const Timesheet = getTenantModel(connection, 'Timesheet');
  const Project = connection.models.Project
    || connection.model('Project', new (require('mongoose').Schema)({}, { strict: false }), 'projects');

  const teamMembers = await TenantUser.find({
    reportingManager: managerEmail,
    isActive: true
  }).select('_id email employeeId firstName lastName').lean();

  const totalMembers = teamMembers.length;
  const teamEmails = teamMembers.map((m) => m.email);
  const teamUserIds = teamMembers.map((m) => m._id);
  const teamEmployeeIds = teamMembers.map((m) => m.employeeId).filter(Boolean);

  const todayStart = startOfDay();
  const todayEnd = endOfDay();

  const [pendingApprovals, onLeave] = await Promise.all([
    LeaveRequest.countDocuments({
      reportingManager: managerEmail,
      status: 'pending'
    }),
    LeaveRequest.countDocuments({
      $or: [
        { reportingManager: managerEmail },
        { employeeEmail: { $in: teamEmails } }
      ],
      status: 'approved',
      startDate: { $lte: todayEnd },
      endDate: { $gte: todayStart }
    })
  ]);

  let present = null;
  let attendanceTracked = false;
  if (Attendance && teamEmployeeIds.length > 0) {
    const records = await Attendance.countDocuments({
      employee: { $in: teamEmployeeIds },
      date: { $gte: todayStart, $lte: todayEnd }
    });
    if (records > 0) {
      attendanceTracked = true;
      present = await Attendance.countDocuments({
        employee: { $in: teamEmployeeIds },
        date: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['present', 'late', 'half-day'] }
      });
    }
  }

  let allocatedToProjects = 0;
  try {
    const projects = await Project.find({
      $or: [
        { assignedManagers: { $in: teamUserIds } },
        { assignedEmployees: { $in: teamUserIds } }
      ]
    }).select('assignedEmployees').lean();
    const allocated = new Set();
    for (const project of projects) {
      for (const emp of project.assignedEmployees || []) {
        allocated.add(String(emp));
      }
    }
    allocatedToProjects = teamUserIds.filter((id) => allocated.has(String(id))).length;
  } catch (_) {
    allocatedToProjects = 0;
  }

  let timesheetsPending = 0;
  if (Timesheet && teamEmployeeIds.length > 0) {
    timesheetsPending = await Timesheet.countDocuments({
      employee: { $in: teamEmployeeIds },
      status: 'submitted'
    });
  }

  return {
    totalMembers,
    onLeave,
    pendingApprovals,
    present,
    attendanceTracked,
    allocatedToProjects,
    timesheetsPending
  };
}

module.exports = { getTeamStats, startOfDay, endOfDay };
