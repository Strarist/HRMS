import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const AttendanceMark = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees?status=active');
      setEmployees(response.data.data);
      setAttendanceData(response.data.data.map(emp => ({
        employee: emp._id,
        status: 'present',
        checkIn: '09:00',
        checkOut: '18:00',
        location: 'office'
      })));
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };

  const handleStatusChange = (index, field, value) => {
    const updated = [...attendanceData];
    updated[index][field] = value;
    setAttendanceData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promises = attendanceData.map(data => 
        api.post('/attendance', {
          ...data,
          date,
          checkIn: `${date}T${data.checkIn}`,
          checkOut: `${date}T${data.checkOut}`
        })
      );
      await Promise.all(promises);
      toast.success('Attendance marked successfully');
    } catch (error) {
      toast.error('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mark Attendance</h1>
        <p className="text-gray-400 mt-1">Mark daily attendance for employees</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field max-w-xs"
            required
          />
        </div>

        <div className="card p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, index) => (
                  <tr key={emp._id}>
                    <td>{emp.firstName} {emp.lastName}</td>
                    <td>
                      <select
                        value={attendanceData[index]?.status}
                        onChange={(e) => handleStatusChange(index, 'status', e.target.value)}
                        className="input-field"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="half-day">Half Day</option>
                        <option value="on-leave">On Leave</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="time"
                        value={attendanceData[index]?.checkIn}
                        onChange={(e) => handleStatusChange(index, 'checkIn', e.target.value)}
                        className="input-field"
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={attendanceData[index]?.checkOut}
                        onChange={(e) => handleStatusChange(index, 'checkOut', e.target.value)}
                        className="input-field"
                      />
                    </td>
                    <td>
                      <select
                        value={attendanceData[index]?.location}
                        onChange={(e) => handleStatusChange(index, 'location', e.target.value)}
                        className="input-field"
                      >
                        <option value="office">Office</option>
                        <option value="remote">Remote</option>
                        <option value="field">Field</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button type="submit" disabled={loading} className="btn-primary flex items-center space-x-2">
            <Save size={20} />
            <span>{loading ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceMark;
