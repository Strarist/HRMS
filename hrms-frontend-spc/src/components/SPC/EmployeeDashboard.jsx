import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Modal, Form, Input, Select, message, Avatar, Progress, Timeline } from 'antd';
import { UserOutlined, ProjectOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config/api.config';

const { Option } = Select;
const { TextArea } = Input;

const EmployeeDashboard = ({ user: userProp }) => {
  const { user: authUser } = useAuth();
  const user = userProp || authUser;
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [timesheetModalVisible, setTimesheetModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [timesheetForm] = Form.useForm();

  useEffect(() => {
    fetchDashboardData();
    fetchTasks();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.apiBaseUrl}/spc/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      
      if (response.data.success) {
        setProjects(response.data.data.projects || []);
      }
    } catch (error) {
      // Empty projects is fine for a newly seeded employee
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (error) {
      setTasks([]);
    }
  };

  const handleLeaveRequest = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post(`${config.apiBaseUrl}/employee/leaves/apply`, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      
      if (response.data.success) {
        message.success('Leave request submitted successfully');
        setLeaveModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };


  const handleTimesheetSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post(`${config.apiBaseUrl}/timesheets`, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      
      if (response.data.success) {
        message.success('Timesheet submitted successfully');
        setTimesheetModalVisible(false);
        timesheetForm.resetFields();
      }
    } catch (error) {
      message.error('Failed to submit timesheet');
    } finally {
      setLoading(false);
    }
  };

  const getTaskStatusColor = (status) => {
    const colors = {
      'completed': 'green',
      'in-progress': 'blue',
      'pending': 'orange',
      'overdue': 'red'
    };
    return colors[status] || 'default';
  };

  const getTaskPriorityColor = (priority) => {
    const colors = {
      'low': 'default',
      'medium': 'blue',
      'high': 'orange',
      'critical': 'red'
    };
    return colors[priority] || 'default';
  };

  const projectColumns = [
    {
      title: 'Project',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          <br />
          <small>{record.description}</small>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color="green">
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Your Role',
      key: 'role',
      render: () => (
        <Tag color="blue">
          TEAM MEMBER
        </Tag>
      )
    },
    {
      title: 'Timeline',
      key: 'timeline',
      render: (record) => (
        <div>
          <CalendarOutlined /> {record.startDate ? new Date(record.startDate).toLocaleDateString() : 'N/A'}
          <br />
          <small>to {record.endDate ? new Date(record.endDate).toLocaleDateString() : 'No end date'}</small>
        </div>
      )
    }
  ];

  const taskColumns = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          <br />
          <small>Project: {record.project}</small>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getTaskStatusColor(status)}>
          {status?.replace('-', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getTaskPriorityColor(priority)}>
          {priority?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (dueDate) => (
        <div>
          <CalendarOutlined /> {dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set'}
          <br />
          <small>
            {dueDate && new Date(dueDate) < new Date() ? 
              <Tag color="red">OVERDUE</Tag> : 
              <Tag color="green">ON TIME</Tag>
            }
          </small>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <div>
          <Button size="small" style={{ marginRight: 8 }}>
            Update Status
          </Button>
          <Button size="small" type="primary">
            View Details
          </Button>
        </div>
      )
    }
  ];

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <h1>Employee Dashboard</h1>
          <p>Welcome back, {user?.firstName}! Here's your work overview.</p>
        </Col>
        <Col>
          <Avatar size="large" icon={<UserOutlined />} />
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Assigned Projects"
              value={projects.length}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed Tasks"
              value={completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Tasks"
              value={pendingTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Overdue Tasks"
              value={overdueTasks}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Button 
            type="primary" 
            size="large" 
            block 
            onClick={() => setTimesheetModalVisible(true)}
          >
            Submit Timesheet
          </Button>
        </Col>
        <Col span={8}>
          <Button 
            size="large" 
            block 
            onClick={() => setLeaveModalVisible(true)}
          >
            Request Leave
          </Button>
        </Col>
        <Col span={8}>
          <Button 
            size="large" 
            block 
          >
            View Profile
          </Button>
        </Col>
      </Row>

      {/* My Projects */}
      <Card title="My Projects" style={{ marginBottom: '24px' }}>
        <Table
          columns={projectColumns}
          dataSource={projects}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* My Tasks */}
      <Card title="My Tasks">
        <Table
          columns={taskColumns}
          dataSource={tasks}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Leave Request Modal */}
      <Modal
        title="Request Leave"
        visible={leaveModalVisible}
        onCancel={() => setLeaveModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLeaveRequest}
        >
          <Form.Item
            name="leaveType"
            label="Leave Type"
            rules={[{ required: true, message: 'Please select leave type' }]}
          >
            <Select placeholder="Select leave type">
              <Option value="sick">Sick Leave</Option>
              <Option value="casual">Casual Leave</Option>
              <Option value="vacation">Vacation</Option>
              <Option value="maternity">Maternity Leave</Option>
              <Option value="paternity">Paternity Leave</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <Select placeholder="Select start date">
                  <Option value="today">Today</Option>
                  <Option value="tomorrow">Tomorrow</Option>
                  <Option value="next-week">Next Week</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="End Date"
                rules={[{ required: true, message: 'Please select end date' }]}
              >
                <Select placeholder="Select end date">
                  <Option value="today">Today</Option>
                  <Option value="tomorrow">Tomorrow</Option>
                  <Option value="next-week">Next Week</Option>
                  <Option value="next-month">Next Month</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: 'Please enter reason for leave' }]}
          >
            <TextArea rows={4} placeholder="Enter reason for leave request" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Submit Leave Request
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Timesheet Modal */}
      <Modal
        title="Submit Timesheet"
        visible={timesheetModalVisible}
        onCancel={() => setTimesheetModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={timesheetForm}
          layout="vertical"
          onFinish={handleTimesheetSubmit}
        >
          <Form.Item
            name="project"
            label="Project"
            rules={[{ required: true, message: 'Please select project' }]}
          >
            <Select placeholder="Select project">
              {projects.map(project => (
                <Option key={project._id} value={project._id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <Select placeholder="Select date">
              <Option value="today">Today</Option>
              <Option value="yesterday">Yesterday</Option>
              <Option value="this-week">This Week</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="hours"
            label="Hours Worked"
            rules={[{ required: true, message: 'Please enter hours worked' }]}
          >
            <Input type="number" placeholder="Enter hours worked" min="1" max="24" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Work Description"
            rules={[{ required: true, message: 'Please describe your work' }]}
          >
            <TextArea rows={4} placeholder="Describe what you worked on" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Submit Timesheet
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeDashboard;
