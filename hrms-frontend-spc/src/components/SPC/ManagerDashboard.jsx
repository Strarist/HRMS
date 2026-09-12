import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Modal, Form, Input, Select, message, Progress, Avatar } from 'antd';
import { TeamOutlined, ProjectOutlined, CalendarOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../../api/axios';

const { Option } = Select;
const { TextArea } = Input;

const ManagerDashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🔍 Manager Dashboard: Starting fetchDashboardData...');
      setLoading(true);
      
      // Use manager-specific endpoints
      console.log('🔍 Manager Dashboard: Fetching projects from /manager/projects...');
      const projectsResponse = await api.get('/manager/projects');
      
      console.log('🔍 Manager Dashboard: Projects response:', projectsResponse.data);
      console.log('🔍 Manager Dashboard: Projects response success:', projectsResponse.data.success);
      console.log('🔍 Manager Dashboard: Projects data:', projectsResponse.data.data);
      
      if (projectsResponse.data.success) {
        const projects = projectsResponse.data.data || [];
        console.log('🔍 Manager Dashboard: Setting projects:', projects.length);
        setProjects(projects);
        
        // Extract team members from the assigned projects
        const teamMembersSet = new Set();
        projects.forEach(project => {
          console.log('🔍 Manager Dashboard: Processing project:', project.name, 'assignedHRs:', project.assignedHRs);
          if (project.assignedHRs) {
            project.assignedHRs.forEach(hrId => teamMembersSet.add(hrId));
          }
        });
        
        console.log('🔍 Manager Dashboard: Team member IDs:', Array.from(teamMembersSet));
        
        // Get user details for team members
        if (teamMembersSet.size > 0) {
          console.log('🔍 Manager Dashboard: Fetching user details...');
          const usersResponse = await api.get('/user/all');
          console.log('🔍 Manager Dashboard: Users response:', usersResponse.data.success);
          
          if (usersResponse.data.success) {
            const allUsers = usersResponse.data.data || [];
            console.log('🔍 Manager Dashboard: Total users fetched:', allUsers.length);
            
            const teamMembers = allUsers.filter(user => {
              const match = teamMembersSet.has(user._id) || teamMembersSet.has(user.id);
              if (match) {
                console.log('🔍 Manager Dashboard: Found team member:', user.email, 'ID:', user._id);
              }
              return match;
            });
            
            console.log('🔍 Manager Dashboard: Filtered team members:', teamMembers.length);
            setTeamMembers(teamMembers);
          }
        } else {
          console.log('🔍 Manager Dashboard: No team members to fetch');
          setTeamMembers([]);
        }
      } else {
        console.error('🔍 Manager Dashboard: Projects response failed:', projectsResponse.data);
      }
    } catch (error) {
      console.error('❌ Manager Dashboard: Failed to fetch data:', error);
      console.error('❌ Manager Dashboard: Error details:', error.response?.data);
      message.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      setLoading(true);
      const response = await api.get(`/manager/projects/${projectId}`);
      
      console.log('🔍 Manager Dashboard: Project details response:', response.data);
      
      if (response.data.success) {
        setProjectDetails(response.data.data);
        setDetailsModalVisible(true);
      }
    } catch (error) {
      message.error('Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (values) => {
    try {
      setLoading(true);
      // Use manager-specific task endpoint
      const response = await api.post(`/manager/projects/${selectedProject._id}/tasks`, values);
      
      if (response.data.success) {
        message.success('Task created successfully');
        setTaskModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      message.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const openTaskModal = (project) => {
    setSelectedProject(project);
    setTaskModalVisible(true);
  };

  const getProjectStatusColor = (status) => {
    const colors = {
      active: 'green',
      completed: 'blue',
      'on-hold': 'orange',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const getProjectPriorityColor = (priority) => {
    const colors = {
      low: 'default',
      medium: 'blue',
      high: 'orange',
      critical: 'red'
    };
    return colors[priority] || 'default';
  };

  const getProjectProgress = (project) => {
    // Simulate progress calculation
    if (project.status === 'completed') return 100;
    if (project.status === 'active') {
      const elapsed = Date.now() - new Date(project.startDate).getTime();
      const total = new Date(project.endDate).getTime() - new Date(project.startDate).getTime();
      return Math.min(Math.round((elapsed / total) * 100), 95);
    }
    return 0;
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
        <Tag color={getProjectStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getProjectPriorityColor(priority)}>
          {priority?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (record) => {
        const progress = getProjectProgress(record);
        return (
          <Progress 
            percent={progress} 
            size="small" 
            status={progress === 100 ? 'success' : 'active'}
          />
        );
      }
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
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <div>
          <Button 
            size="small" 
            onClick={() => fetchProjectDetails(record._id)}
            style={{ marginRight: 8 }}
          >
            Details
          </Button>
          <Button 
            size="small" 
            type="primary"
            onClick={() => openTaskModal(record)}
          >
            Add Task
          </Button>
        </div>
      )
    }
  ];

  const teamColumns = [
    {
      title: 'Team Member',
      dataIndex: 'email',
      key: 'email',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ marginRight: 12 }}
          />
          <div>
            <strong>{record.firstName} {record.lastName}</strong>
            <br />
            <small>{text}</small>
          </div>
        </div>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'hr' ? 'green' : role === 'manager' ? 'blue' : 'default'}>
          {role?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="blue" icon={<CheckCircleOutlined />}>
          ACTIVE
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <div>
          <Button size="small" style={{ marginRight: 8 }}>
            View Profile
          </Button>
          <Button size="small" type="primary">
            Assign Task
          </Button>
        </div>
      )
    }
  ];

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');

  console.log('🔍 Manager Dashboard: Total projects:', projects.length);
  console.log('🔍 Manager Dashboard: Active projects:', activeProjects.length);
  console.log('🔍 Manager Dashboard: Completed projects:', completedProjects.length);

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <h1>Manager Dashboard</h1>
          <p>Welcome back, {user?.firstName}! Manage your projects and team.</p>
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
              title="Active Projects"
              value={activeProjects.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="HR Team Members"
              value={teamMembers.filter(m => m.role === 'hr').length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Team Size"
              value={teamMembers.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Assigned Projects */}
      <Card title="Your Assigned Projects" style={{ marginBottom: '24px' }}>
        <Table
          columns={projectColumns}
          dataSource={activeProjects}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* HR Team Members */}
      <Card title="Your HR Team Members" style={{ marginBottom: '24px' }}>
        <Table
          columns={teamColumns}
          dataSource={teamMembers.filter(m => m.role === 'hr')}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* All Team Members */}
      <Card title="All Team Members" style={{ marginBottom: '24px' }}>
        <Table
          columns={teamColumns}
          dataSource={teamMembers}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Project Details Modal */}
      <Modal
        title={projectDetails?.name}
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={800}
      >
        {projectDetails && (
          <div>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Card size="small" title="Project Information">
                  <p><strong>Status:</strong> <Tag color={getProjectStatusColor(projectDetails.status)}>{projectDetails.status?.toUpperCase()}</Tag></p>
                  <p><strong>Priority:</strong> <Tag color={getProjectPriorityColor(projectDetails.priority)}>{projectDetails.priority?.toUpperCase()}</Tag></p>
                  <p><strong>Start Date:</strong> {projectDetails.startDate ? new Date(projectDetails.startDate).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>End Date:</strong> {projectDetails.endDate ? new Date(projectDetails.endDate).toLocaleDateString() : 'Not set'}</p>
                  <p><strong>Description:</strong> {projectDetails.description || 'No description'}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Team Assignments">
                  <p><strong>Assigned Managers:</strong></p>
                  <div style={{ marginBottom: '12px' }}>
                    {projectDetails.assignedManagers && projectDetails.assignedManagers.length > 0 
                      ? projectDetails.assignedManagers.map((manager, index) => (
                          <div key={index} style={{ marginBottom: '4px' }}>
                            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                            <strong>{typeof manager === 'string' ? manager : `${manager.firstName} ${manager.lastName}`}</strong>
                          </div>
                        ))
                      : <span>No managers assigned</span>
                    }
                  </div>
                  <p><strong>Assigned HRs:</strong></p>
                  <div>
                    {projectDetails.assignedHRs && projectDetails.assignedHRs.length > 0 
                      ? projectDetails.assignedHRs.map((hr, index) => (
                          <div key={index} style={{ marginBottom: '4px' }}>
                            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                            <strong>{typeof hr === 'string' ? hr : `${hr.firstName} ${hr.lastName}`}</strong>
                          </div>
                        ))
                      : <span>No HRs assigned</span>
                    }
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Create Task Modal */}
      <Modal
        title={`Create Task for ${selectedProject?.name}`}
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTask}
        >
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Task Description"
            rules={[{ required: true, message: 'Please enter task description' }]}
          >
            <TextArea rows={3} placeholder="Enter task description" />
          </Form.Item>

          <Form.Item
            name="assignedTo"
            label="Assign To"
            rules={[{ required: true, message: 'Please select team member' }]}
          >
            <Select placeholder="Select HR team member">
              {teamMembers.map(member => (
                <Option key={member._id} value={member._id}>
                  {member.firstName} {member.lastName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Select placeholder="Select priority">
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="critical">Critical</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Please select due date' }]}
          >
            <Select placeholder="Select due date" style={{ width: '100%' }}>
              <Option value="today">Today</Option>
              <Option value="tomorrow">Tomorrow</Option>
              <Option value="week">This Week</Option>
              <Option value="month">This Month</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Create Task
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerDashboard;
