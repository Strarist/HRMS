import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Row,
  Col,
  Statistic,
  Avatar,
  Typography,
  Descriptions,
  Tabs
} from 'antd';
import {
  ProjectOutlined,
  TeamOutlined,
  UserOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import api from '../../api/axios';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const ManagerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      console.log('🔍 Manager Projects: Starting fetchManagerData...');
      setLoading(true);
      
      // Get manager's assigned projects
      const projectsResponse = await api.get('/manager/projects');
      console.log('🔍 Manager Projects: Projects response:', projectsResponse.data);
      
      if (projectsResponse.data.success) {
        const managerProjects = projectsResponse.data.data || [];
        console.log('🔍 Manager Projects: Setting projects:', managerProjects.length);
        setProjects(managerProjects);
        
        // Extract team members from assigned projects
        const allTeamMembers = [];
        const memberIds = new Set();
        
        managerProjects.forEach(project => {
          console.log('🔍 Manager Projects: Processing project:', project.name);
          
          // Add assigned HRs
          if (project.assignedHRs) {
            project.assignedHRs.forEach(hrId => memberIds.add(hrId.toString()));
          }
          
          // Add assigned employees (if any)
          if (project.assignedEmployees) {
            project.assignedEmployees.forEach(empId => memberIds.add(empId.toString()));
          }
        });
        
        console.log('🔍 Manager Projects: Team member IDs:', Array.from(memberIds));
        
        // Get user details for team members
        if (memberIds.size > 0) {
          try {
            const usersResponse = await api.get('/user/all');
            if (usersResponse.data.success) {
              const allUsers = usersResponse.data.data || [];
              const teamMembers = allUsers.filter(user => 
                memberIds.has(user._id?.toString()) || memberIds.has(user.id?.toString())
              );
              console.log('🔍 Manager Projects: Filtered team members:', teamMembers.length);
              setTeamMembers(teamMembers);
            }
          } catch (userError) {
            console.warn('⚠️ Manager Projects: Could not fetch user details:', userError);
            // Continue without team member details - don't fail the entire request
            setTeamMembers([]);
          }
        } else {
          setTeamMembers([]);
        }
      }
    } catch (error) {
      console.error('❌ Manager Projects: Failed to fetch projects:', error);
      message.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

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
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showProjectDetails(record)}
          >
            Details
          </Button>
        </Space>
      )
    }
  ];

  const teamColumns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{record.firstName} {record.lastName}</Text>
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'hr' ? 'purple' : role === 'employee' ? 'blue' : 'green'}>
          {role?.toUpperCase() || 'UNKNOWN'}
        </Tag>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => dept || 'N/A'
    }
  ];

  const showProjectDetails = (project) => {
    setSelectedProject(project);
    setDetailsModalVisible(true);
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Manager Dashboard</Title>
      
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
              title="Team Members"
              value={teamMembers.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed Projects"
              value={completedProjects.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="My Projects" key="projects">
            <Table
              columns={projectColumns}
              dataSource={projects}
              loading={loading}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              locale={{
                emptyText: 'No projects assigned to you yet'
              }}
            />
          </TabPane>
          
          <TabPane tab="Team Members" key="team">
            <Table
              columns={teamColumns}
              dataSource={teamMembers}
              loading={loading}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              locale={{
                emptyText: 'No team members found'
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Project Details Modal */}
      <Modal
        title={selectedProject?.name}
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
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

            <Title level={4} style={{ marginTop: '24px' }}>Assigned Team</Title>
            <Table
              columns={teamColumns}
              dataSource={teamMembers.filter(member => 
                selectedProject.assignedHRs?.includes(member._id) ||
                selectedProject.assignedEmployees?.includes(member._id)
              )}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerProjects;
