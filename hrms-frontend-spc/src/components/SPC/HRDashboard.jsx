import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Modal, Form, Input, Select, message, Tabs, Avatar, Badge, Descriptions, Typography } from 'antd';
import { TeamOutlined, ProjectOutlined, CalendarOutlined, UserOutlined, FileTextOutlined, CheckCircleOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import api from '../../api/axios';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const HRDashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [candidateModalVisible, setCandidateModalVisible] = useState(false);
  const [projectDetailsModalVisible, setProjectDetailsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDashboardData();
    fetchCandidates();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get HR's assigned projects and team information
      const response = await api.get('/spc/dashboard');
      
      if (response.data.success) {
        const projectsData = response.data.data.projects || [];
        setProjects(projectsData);
        
        // Extract managers from projects to show reporting structure
        const managerSet = new Set();
        projectsData.forEach(project => {
          if (project.assignedManagers) {
            project.assignedManagers.forEach(manager => {
              managerSet.add(JSON.stringify(manager));
            });
          }
        });
        
        const uniqueManagers = Array.from(managerSet).map(managerStr => JSON.parse(managerStr));
        setManagers(uniqueManagers);
        
        // Get detailed team member information
        await fetchTeamMembers(projectsData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      message.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (projectsData) => {
    try {
      // Get all users to find team members
      const usersResponse = await api.get('/user/all');
      if (usersResponse.data.success) {
        const allUsers = usersResponse.data.data || [];
        
        // Extract team member IDs from projects
        const teamMemberIds = new Set();
        projectsData.forEach(project => {
          if (project.assignedEmployees) {
            project.assignedEmployees.forEach(empId => teamMemberIds.add(empId.toString()));
          }
        });
        
        const teamMembers = allUsers.filter(user => 
          teamMemberIds.has(user._id?.toString()) || teamMemberIds.has(user.id?.toString())
        );
        
        setTeamMembers(teamMembers);
      }
    } catch (error) {
      console.warn('Could not fetch team members:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/candidates');
      if (response.data.success) {
        setCandidates(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    }
  };

  const showProjectDetails = (project) => {
    setSelectedProject(project);
    setProjectDetailsModalVisible(true);
  };

  // Project columns for table
  const projectColumns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : status === 'completed' ? 'blue' : 'orange'}>
          {status?.toUpperCase() || 'UNKNOWN'}
        </Tag>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'default'}>
          {priority?.toUpperCase() || 'MEDIUM'}
        </Tag>
      )
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => {
        const start = record.startDate ? new Date(record.startDate).toLocaleDateString() : 'N/A';
        const end = record.endDate ? new Date(record.endDate).toLocaleDateString() : 'N/A';
        return `${start} - ${end}`;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<FileTextOutlined />}
          onClick={() => showProjectDetails(record)}
        >
          Details
        </Button>
      )
    }
  ];

  // Manager columns for reporting structure
  const managerColumns = [
    {
      title: 'Manager',
      key: 'manager',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.firstName} {record.lastName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          {record.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <PhoneOutlined style={{ fontSize: '12px' }} />
              <span style={{ fontSize: '12px' }}>{record.phone}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MailOutlined style={{ fontSize: '12px' }} />
            <span style={{ fontSize: '12px' }}>{record.email}</span>
          </div>
        </div>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => dept || <Text type="secondary">Not Assigned</Text>
    }
  ];

  // Team member columns
  const teamMemberColumns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.firstName} {record.lastName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color="blue">{role?.toUpperCase() || 'EMPLOYEE'}</Tag>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => dept || <Text type="secondary">Not Assigned</Text>
    }
  ];

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>HR Dashboard</Title>
      
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Assigned Projects"
              value={projects.length}
              prefix={<ProjectOutlined />}
              styles={{ content: { color: '#3f8600' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={activeProjects.length}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Reporting Managers"
              value={managers.length}
              prefix={<UserOutlined />}
              styles={{ content: { color: '#722ed1' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Team Members"
              value={teamMembers.length}
              prefix={<TeamOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <Tabs 
          defaultActiveKey="projects"
          items={[
            {
              key: 'projects',
              label: 'My Projects',
              children: (
                <Table
                  columns={projectColumns}
                  dataSource={projects}
                  loading={loading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  locale={{
                    emptyText: 'No projects assigned to you'
                  }}
                />
              )
            },
            {
              key: 'managers',
              label: 'Reporting Structure',
              children: (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <Text type="secondary">
                      Managers you need to report to for your assigned projects
                    </Text>
                  </div>
                  <Table
                    columns={managerColumns}
                    dataSource={managers}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    locale={{
                      emptyText: 'No managers found'
                    }}
                  />
                </>
              )
            },
            {
              key: 'team',
              label: 'Team Members',
              children: (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <Text type="secondary">
                      Team members assigned to your projects
                    </Text>
                  </div>
                  <Table
                    columns={teamMemberColumns}
                    dataSource={teamMembers}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    locale={{
                      emptyText: 'No team members found'
                    }}
                  />
                </>
              )
            }
          ]}
        />
      </Card>

      {/* Project Details Modal */}
      <Modal
        title={selectedProject?.name}
        open={projectDetailsModalVisible}
        onCancel={() => setProjectDetailsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedProject && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Project Name">{selectedProject.name}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedProject.status === 'active' ? 'green' : 'orange'}>
                  {selectedProject.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Tag color={selectedProject.priority === 'high' ? 'red' : 'orange'}>
                  {selectedProject.priority?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedProject.description || 'No description provided'}
              </Descriptions.Item>
            </Descriptions>

            {selectedProject.assignedManagers && selectedProject.assignedManagers.length > 0 && (
              <>
                <Title level={4} style={{ marginTop: '24px' }}>Reporting Managers</Title>
                <Table
                  dataSource={selectedProject.assignedManagers}
                  columns={[
                    {
                      title: 'Name',
                      render: (_, record) => `${record.firstName} ${record.lastName}`
                    },
                    {
                      title: 'Email',
                      dataIndex: 'email'
                    },
                    {
                      title: 'Phone',
                      dataIndex: 'phone'
                    }
                  ]}
                  pagination={false}
                  size="small"
                />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HRDashboard;
