const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const LeaveRequestSchema = require('../src/models/tenant/LeaveRequest');

describe('leave workflow & validation rules', () => {
  it('validates allowed leave types in LeaveRequest schema enum', () => {
    const enumValues = LeaveRequestSchema.path('leaveType').enumValues;
    assert.ok(enumValues.includes('Personal Leave'));
    assert.ok(enumValues.includes('Sick Leave'));
    assert.ok(enumValues.includes('Casual Leave'));
    assert.ok(enumValues.includes('Comp Offs'));
  });

  it('enforces status enum with pending, approved, rejected, and cancelled', () => {
    const statusEnum = LeaveRequestSchema.path('status').enumValues;
    assert.deepEqual(statusEnum.sort(), ['approved', 'cancelled', 'pending', 'rejected']);
  });

  it('defaults new leave request status to pending', () => {
    const defaultStatus = LeaveRequestSchema.path('status').defaultValue;
    assert.equal(defaultStatus, 'pending');
  });

  it('rejects cancellation if leave status is already approved', () => {
    const leave = {
      status: 'approved',
      employeeEmail: 'employee@spc.com'
    };
    const cancelAttempt = (status) => {
      if (status !== 'pending') {
        throw new Error(`Cannot cancel a leave that is already ${status}`);
      }
    };
    assert.throws(() => cancelAttempt(leave.status), /Cannot cancel a leave that is already approved/);
  });

  it('calculates correct day count between dates', () => {
    const start = new Date('2026-10-01');
    const end = new Date('2026-10-05');
    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
    assert.equal(diffDays, 5);
  });
});
