const { getTenantConnection } = require('../config/database.config');
const TenantUserSchema = require('../models/tenant/TenantUser');
const LeaveBalanceSchema = require('../models/tenant/LeaveBalance');
const LeaveRequestSchema = require('../models/tenant/LeaveRequest');
const AnnouncementSchema = require('../models/tenant/Announcement');

/**
 * Employee Dashboard Controller
 * Handles HTTP requests for employee dashboard operations
 * @module controllers/employeeDashboardController
 */

/**
 * Get employee dashboard overview
 * @route GET /api/employee/dashboard
 * @access Private (Employee)
 */
exports.getDashboardOverview = async (req, res) => {
  try {
    const user = req.user;
    const companyId = req.companyId;
    const today = new Date();
    const currentYear = today.getFullYear();

    // Build base employee object from JWT claims
    const employee = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      employeeCode: user.employeeId || 'N/A',
      designation: user.designation || 'Employee',
      department: { name: user.department || 'Not Assigned' },
      profileImage: user.profileImage || null,
      joiningDate: user.joiningDate || null
    };

    // Get shift timing (kept static until WorkSchedule domain is live)
    const shiftTiming = {
      name: 'GENERAL',
      startTime: '10:00 AM',
      endTime: '07:00 PM',
      totalHours: 8,
      workedToday: null
    };

    // Real data from tenant DB
    let totalAvailable = 0;
    let totalConsumed = 0;
    let pendingLeaveCount = 0;
    let upcomingHolidays = [];
    let announcements = [];

    if (companyId) {
      const tenantConn = await getTenantConnection(companyId);

      // ── Leave balances ──────────────────────────────────────────────────────
      const LeaveBalance = tenantConn.models.LeaveBalance ||
        tenantConn.model('LeaveBalance', LeaveBalanceSchema);

      const balances = await LeaveBalance.find({
        employeeEmail: user.email,
        year: currentYear
      }).lean();

      for (const b of balances) {
        totalAvailable += b.available || 0;
        totalConsumed += b.consumed || 0;
      }

      // ── Pending leave count ─────────────────────────────────────────────────
      const LeaveRequest = tenantConn.models.LeaveRequest ||
        tenantConn.model('LeaveRequest', LeaveRequestSchema);

      pendingLeaveCount = await LeaveRequest.countDocuments({
        employeeEmail: user.email,
        status: 'pending'
      });

      // ── Upcoming holidays (next 30 days) ────────────────────────────────────
      try {
        const Holiday = tenantConn.models.Holiday ||
          tenantConn.model('Holiday', require('../models/Holiday').schema);

        const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        upcomingHolidays = await Holiday.find({
          date: { $gte: today, $lte: in30Days },
          isActive: true
        }).sort({ date: 1 }).limit(5).lean();
      } catch (_) {
        // Holiday model may not be in tenant DB — leave empty
        upcomingHolidays = [];
      }

      // ── Announcements (active, non-expired, visible to this role) ──────────
      try {
        const Announcement = tenantConn.models.Announcement ||
          tenantConn.model('Announcement', AnnouncementSchema);

        const role = user.role;
        const audienceFilter = role === 'employee'
          ? { $in: ['all', 'employees'] }
          : { $in: ['all', 'employees', 'managers'] };

        announcements = await Announcement.find({
          isActive: true,
          targetAudience: audienceFilter,
          $or: [{ scheduledFor: { $exists: false } }, { scheduledFor: { $lte: today } }],
          $and: [
            { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: today } }] }
          ]
        }).sort({ priority: -1, createdAt: -1 }).limit(10).lean();
      } catch (_) {
        announcements = [];
      }
    }

    const dashboardData = {
      employee: {
        name: `${employee.firstName} ${employee.lastName}`.trim(),
        email: employee.email,
        employeeCode: employee.employeeCode,
        designation: employee.designation,
        department: employee.department?.name || 'Not Assigned',
        profileImage: employee.profileImage || null,
        joiningDate: employee.joiningDate
      },
      shiftTiming,
      quickStats: {
        remainingLeaves: totalAvailable,
        consumedLeaves: totalConsumed,
        pendingLeaves: pendingLeaveCount,
        attendancePercentage: null, // calculated when Attendance domain is live
        activeProjects: 0,
        pendingRequests: pendingLeaveCount
      },
      todayAttendance: null, // populated when Attendance domain is live
      upcomingHolidays: upcomingHolidays.map(h => ({
        _id: h._id,
        name: h.name,
        date: h.date,
        type: h.type || 'public',
        description: h.description
      })),
      offThisWeek: [],   // populated when Attendance/Leave cross-team is live
      birthdays: [],     // populated when employee birth dates are seeded
      anniversaries: [], // populated when employee joining dates are seeded
      announcements,
      teamMembers: [],
      manager: null
    };

    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard overview'
    });
  }
};



/**
 * Get employee leave summary
 * @route GET /api/employee/leaves/summary
 * @access Private (Employee)
 */
exports.getLeaveSummary = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    
    // Mock leave summary data
    const leaveSummary = {
      year: year,
      totalLeaves: 20,
      usedLeaves: 5,
      remainingLeaves: 15,
      leaveTypes: [
        { type: 'Casual Leave', total: 10, used: 2, remaining: 8 },
        { type: 'Sick Leave', total: 7, used: 1, remaining: 6 },
        { type: 'Earned Leave', total: 3, used: 2, remaining: 1 }
      ]
    };

    res.status(200).json({
      success: true,
      data: leaveSummary
    });
  } catch (error) {
    console.error('Error fetching leave summary:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch leave summary'
    });
  }
};

/**
 * Get employee attendance summary
 * @route GET /api/employee/attendance/summary
 * @access Private (Employee)
 */
exports.getAttendanceSummary = async (req, res) => {
  try {
    const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth();
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

    // Mock attendance summary with more details
    const attendanceSummary = {
      month: month,
      year: year,
      totalWorkingDays: 22,
      presentDays: 20,
      absentDays: 0,
      halfDays: 1,
      lateDays: 1,
      leaveDays: 1,
      weekendDays: 8,
      holidayDays: 0,
      attendancePercentage: 95.45,
      avgWorkHours: '8h 30m',
      totalWorkHours: 170,
      overtimeHours: 10
    };

    res.status(200).json({
      success: true,
      data: attendanceSummary
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch attendance summary'
    });
  }
};

/**
 * Get employee payslip history
 * @route GET /api/employee/payslips
 * @access Private (Employee)
 */
exports.getPayslipHistory = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 12;
    
    // Mock payslip data
    const payslips = [];
    const currentDate = new Date();
    
    for (let i = 0; i < Math.min(limit, 6); i++) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      payslips.push({
        _id: `payslip_${i}`,
        month: month.toLocaleString('default', { month: 'long' }),
        year: month.getFullYear(),
        grossSalary: 50000,
        netSalary: 42000,
        status: 'paid',
        paidOn: month
      });
    }

    res.status(200).json({
      success: true,
      data: payslips
    });
  } catch (error) {
    console.error('Error fetching payslip history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payslip history'
    });
  }
};

/**
 * Get employee projects
 * @route GET /api/employee/projects
 * @access Private (Employee)
 */
exports.getEmployeeProjects = async (req, res) => {
  try {
    const tenantConnection = req.tenant.connection;
    const userId = req.user.id;
    
    // Helper to get/create tenant-scoped models safely
    const getTenantModel = (modelName, modelPath) => {
      if (tenantConnection.models[modelName]) {
        return tenantConnection.models[modelName];
      }

      const modelModule = require(modelPath);
      const schema = modelModule.schema || modelModule;
      return tenantConnection.model(modelName, schema);
    };

    // Register required tenant models (ensures population works)
    const Project = getTenantModel('Project', '../models/Project');
    getTenantModel('Client', '../models/Client');
    getTenantModel('Employee', '../models/Employee');
    const TenantUser = getTenantModel('User', '../models/tenant/TenantUser');

    // Get current user to find their employee record
    const currentUser = await TenantUser.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find projects where the user is a team member or project manager
    const projects = await Project.find({
      $or: [
        { 'teamMembers.employee': currentUser._id },
        { projectManager: currentUser._id }
      ],
      isActive: true
    })
    .populate('client', 'name companyName')
    .populate('projectManager', 'firstName lastName email')
    .populate('teamMembers.employee', 'firstName lastName email')
    .sort({ startDate: -1 });

    // Format projects with user's role
    const formattedProjects = projects.map(project => {
      const teamMember = project.teamMembers.find(
        tm => tm.employee && tm.employee._id.toString() === currentUser._id.toString()
      );
      
      const isManager = project.projectManager && 
        project.projectManager._id.toString() === currentUser._id.toString();

      return {
        _id: project._id,
        name: project.name,
        projectCode: project.projectCode,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        client: project.client,
        projectManager: project.projectManager ? {
          name: `${project.projectManager.firstName} ${project.projectManager.lastName}`,
          email: project.projectManager.email
        } : null,
        myRole: isManager ? 'Project Manager' : (teamMember?.role || 'Team Member'),
        teamSize: project.teamMembers.length,
        isActive: project.isActive
      };
    });

    console.log(`📋 Found ${formattedProjects.length} projects for user ${currentUser.email}`);

    res.status(200).json({
      success: true,
      count: formattedProjects.length,
      data: formattedProjects
    });
  } catch (error) {
    console.error('Error fetching employee projects:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch employee projects'
    });
  }
};

/**
 * Get employee requests
 * @route GET /api/employee/requests
 * @access Private (Employee)
 */
exports.getEmployeeRequests = async (req, res) => {
  try {
    // Mock requests data
    const requests = [];

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching employee requests:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch employee requests'
    });
  }
};

/**
 * Get employee profile
 * @route GET /api/employee/profile
 * @access Private (Employee)
 */
exports.getEmployeeProfile = async (req, res) => {
  try {
    const user = req.user;
    
    // Return user profile from JWT token
    const profile = {
      _id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      department: user.department || 'Engineering',
      designation: user.designation || 'Software Engineer',
      phone: user.phone || '',
      companyName: user.companyName || 'TCS',
      companyId: user.companyId
    };

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch employee profile'
    });
  }
};

/**
 * Update employee profile
 * @route PUT /api/employee/profile
 * @access Private (Employee)
 */
exports.updateEmployeeProfile = async (req, res) => {
  try {
    // For now, return success without actually updating
    // TODO: Implement actual profile update with tenant database
    res.status(200).json({
      success: true,
      message: 'Profile update feature coming soon'
    });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update employee profile'
    });
  }
};
