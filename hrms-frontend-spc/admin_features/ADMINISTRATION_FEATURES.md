# HRMS Administration Features Documentation

## Overview
This document provides comprehensive documentation of the Administration features implemented in the HRMS (Human Resource Management System) frontend. The Administration module is a critical component that enables system administrators to manage users, roles, departments, and policies within the organization.

## Table of Contents
1. [User Management](#user-management)
2. [Role Management](#role-management)
3. [Department Management](#department-management)
4. [Policies Management](#policies-management)
5. [API Integration](#api-integration)
6. [Error Handling](#error-handling)
7. [UI/UX Design](#uiux-design)

## User Management

### Features
- View all system users with their details
- Reset user passwords
- Manage user roles and permissions
- View user activity and status
- Enable/disable user accounts

### Key Components
- **User List**: Displays all users in a tabular format
- **Password Reset Modal**: Secure password reset functionality
- **User Status Toggle**: Enable/disable user accounts
- **Role Assignment**: Assign/revoke roles to/from users

### Implementation Details
- Uses React hooks for state management
- Implements form validation for password resets
- Real-time feedback using toast notifications
- Responsive design for all screen sizes

## Role Management

### Features
- View and manage system roles
- Assign permissions to roles
- Create and edit role definitions
- Role-based access control (RBAC)

### Implementation Status
- Basic role management interface is in place
- Role listing functionality is implemented
- Permission assignment UI is under development

## Department Management

### Features
- View all departments in the organization
- Add new departments
- Edit existing department details
- Assign department heads
- View department hierarchy

### Implementation Details
- Department listing with grid layout
- Department creation form
- Department head assignment
- Responsive card-based UI

## Policies Management

### Features
- View organization policies
- Create and edit policy documents
- Policy version control
- Employee acknowledgment tracking

### Implementation Status
- Basic policy viewing interface
- Policy management features are under development

## API Integration

### Authentication
- JWT-based authentication
- Role-based API access control
- Secure password reset functionality

### Endpoints
- `/user/all` - Get all users
- `/auth/admin/reset-password` - Reset user password
- `/departments` - Department management
- `/roles` - Role management (under development)

## Error Handling
- Form validation errors
- API error handling with user-friendly messages
- Network error handling
- Permission-based access control errors

## UI/UX Design

### Design System
- Clean, modern interface
- Dark theme by default
- Responsive layout
- Consistent component styling

### Components
- Cards for department display
- Modals for forms and actions
- Tables for user and role listings
- Toast notifications for user feedback

## Development Notes

### Dependencies
- React 18+
- React Router
- Axios for API calls
- Lucide Icons
- React Hot Toast for notifications

### Environment Variables
- `REACT_APP_API_URL` - Base URL for API endpoints

### Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the development server: `npm start`

## Future Enhancements
- Complete role-based access control implementation
- Enhanced policy management
- Department hierarchy visualization
- Bulk user operations
- Advanced user search and filtering
- Audit logging for administrative actions

## Troubleshooting
- Ensure the API server is running and accessible
- Verify user has appropriate permissions
- Check browser console for errors
- Clear browser cache if experiencing stale data issues
