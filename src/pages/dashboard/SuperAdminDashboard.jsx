import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Badge, Tabs, Tab, Form, Alert, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/temp";
import "./superAdminDashboard.css";

function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Stats
  const [stats, setStats] = useState(null);
  
  // Users management
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '', firstname: '', lastname: '', role: 'Admin' });
  
  // Security updates
  const [securityUpdates, setSecurityUpdates] = useState([]);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [newSecurity, setNewSecurity] = useState({ title: '', description: '', severity: 'medium' });
  
  // Activity log
  const [activityLog, setActivityLog] = useState([]);
  
  // Admin profile
  const [profile, setProfile] = useState(null);
  const [profileEdit, setProfileEdit] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.token) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchSecurityUpdates(),
        fetchActivityLog(),
        fetchProfile()
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/stats`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/users`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setAllUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchSecurityUpdates = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/security-updates`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSecurityUpdates(res.data);
    } catch (err) {
      console.error("Error fetching security updates:", err);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/activity-log`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setActivityLog(res.data);
    } catch (err) {
      console.error("Error fetching activity log:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/profile`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProfile(res.data);
      setProfileEdit(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleCreateAdmin = async () => {
    setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/users/create-admin`,
        newAdmin,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert(`${newAdmin.role} created successfully!`);
      setShowCreateModal(false);
      setNewAdmin({ username: '', email: '', password: '', firstname: '', lastname: '', role: 'Admin' });
      fetchUsers();
      fetchActivityLog();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (!confirm(`Change user role to ${newRole}?`)) return;
    
    setActionLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchUsers();
      fetchActivityLog();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!confirm(`Delete user ${email}? This cannot be undone!`)) return;
    
    setActionLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchUsers();
      fetchActivityLog();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSecurityUpdate = async () => {
    setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/security-updates`,
        newSecurity,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setShowSecurityModal(false);
      setNewSecurity({ title: '', description: '', severity: 'medium' });
      fetchSecurityUpdates();
      fetchActivityLog();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create security update");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSecurityStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/security-updates/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchSecurityUpdates();
      fetchActivityLog();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setActionLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/profile`,
        profileEdit,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.roles?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const getSeverityBadge = (severity) => {
    const colors = { critical: 'danger', high: 'warning', medium: 'info', low: 'secondary' };
    return <Badge bg={colors[severity] || 'secondary'}>{severity?.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status) => {
    const colors = { pending: 'warning', 'in-progress': 'info', resolved: 'success' };
    return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
  };

  const getRoleBadge = (roles) => {
    if (!roles) return <Badge bg="secondary">No Role</Badge>;
    if (roles.includes('SuperAdmin')) return <Badge bg="danger">🛡️ SuperAdmin</Badge>;
    if (roles.includes('Admin')) return <Badge bg="primary">👤 Admin</Badge>;
    if (roles.includes('Scholar')) return <Badge bg="success">🎓 Scholar</Badge>;
    return <Badge bg="secondary">📚 Learner</Badge>;
  };

  if (loading) {
    return (
      <div className="superadmin-dashboard d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard">
      {/* Header */}
      <div className="superadmin-header">
        <Container>
          <Row className="align-items-center py-4">
            <Col>
              <h1 className="text-white mb-0">
                <i className="bi bi-shield-lock-fill me-3"></i>
                SuperAdmin Control Center
              </h1>
              <p className="text-white-50 mb-0">Full system access and management</p>
            </Col>
            <Col xs="auto">
              <Button variant="outline-light" onClick={() => navigate('/admin-dashboard')} className="me-2">
                <i className="bi bi-arrow-left me-2"></i>Admin Dashboard
              </Button>
              <Button variant="danger" onClick={logout}>
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="stat-card stat-card-users">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted mb-1">Total Users</h6>
                    <h2 className="mb-0">{stats?.totalUsers || allUsers.length}</h2>
                  </div>
                  <div className="stat-icon">
                    <i className="bi bi-people-fill"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card stat-card-videos">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted mb-1">Total Videos</h6>
                    <h2 className="mb-0">{stats?.videos?.total || 0}</h2>
                  </div>
                  <div className="stat-icon">
                    <i className="bi bi-play-circle-fill"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card stat-card-revenue">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted mb-1">Total Revenue</h6>
                    <h2 className="mb-0">€{parseFloat(stats?.revenue?.total_revenue || 0).toFixed(2)}</h2>
                  </div>
                  <div className="stat-icon">
                    <i className="bi bi-currency-euro"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card stat-card-security">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted mb-1">Security Issues</h6>
                    <h2 className="mb-0">{stats?.security?.pending || securityUpdates.filter(s => s.status !== 'resolved').length}</h2>
                  </div>
                  <div className="stat-icon">
                    <i className="bi bi-shield-exclamation"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Content Tabs */}
        <Card className="superadmin-card">
          <Card.Body>
            <Tabs defaultActiveKey="users" className="superadmin-tabs mb-4">
              {/* Users Management Tab */}
              <Tab eventKey="users" title={<><i className="bi bi-people me-2"></i>User Management</>}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Control
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ maxWidth: '400px' }}
                  />
                  <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    <i className="bi bi-plus-circle me-2"></i>Create Admin
                  </Button>
                </div>

                <Table hover responsive className="superadmin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td><strong>{u.username}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.firstname} {u.lastname}</td>
                        <td>{getRoleBadge(u.roles)}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={u.roles?.split(',')[0] || 'Learner'}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            disabled={u.id === user.id}
                            style={{ width: '130px', display: 'inline-block' }}
                            className="me-2"
                          >
                            <option value="Learner">Learner</option>
                            <option value="Scholar">Scholar</option>
                            <option value="Admin">Admin</option>
                            <option value="SuperAdmin">SuperAdmin</option>
                          </Form.Select>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={u.id === user.id}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab>

              {/* Security Updates Tab */}
              <Tab eventKey="security" title={<><i className="bi bi-shield-check me-2"></i>Security Updates</>}>
                <div className="d-flex justify-content-end mb-4">
                  <Button variant="warning" onClick={() => setShowSecurityModal(true)}>
                    <i className="bi bi-plus-circle me-2"></i>Add Security Update
                  </Button>
                </div>

                {securityUpdates.length === 0 ? (
                  <Alert variant="success">
                    <i className="bi bi-check-circle me-2"></i>
                    No security issues reported. System is secure!
                  </Alert>
                ) : (
                  <Table hover responsive className="superadmin-table">
                    <thead>
                      <tr>
                        <th>Severity</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created By</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {securityUpdates.map(su => (
                        <tr key={su.id}>
                          <td>{getSeverityBadge(su.severity)}</td>
                          <td><strong>{su.title}</strong></td>
                          <td>{su.description?.substring(0, 50)}...</td>
                          <td>{getStatusBadge(su.status)}</td>
                          <td>{su.created_by_name}</td>
                          <td>{new Date(su.created_at).toLocaleDateString()}</td>
                          <td>
                            <Form.Select
                              size="sm"
                              value={su.status}
                              onChange={(e) => handleUpdateSecurityStatus(su.id, e.target.value)}
                              style={{ width: '130px' }}
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </Form.Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Tab>

              {/* Activity Log Tab */}
              <Tab eventKey="activity" title={<><i className="bi bi-clock-history me-2"></i>Activity Log</>}>
                <Table hover responsive className="superadmin-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLog.map(log => (
                      <tr key={log.id}>
                        <td>{new Date(log.created_at).toLocaleString()}</td>
                        <td><strong>{log.username}</strong></td>
                        <td>
                          <Badge bg="dark">{log.action}</Badge>
                        </td>
                        <td>{log.details}</td>
                      </tr>
                    ))}
                    {activityLog.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">No activity recorded yet</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Tab>

              {/* Profile Tab */}
              <Tab eventKey="profile" title={<><i className="bi bi-person-gear me-2"></i>My Profile</>}>
                <Row>
                  <Col md={6}>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" value={profile?.username || ''} disabled />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" value={profile?.email || ''} disabled />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileEdit.firstname || ''}
                          onChange={(e) => setProfileEdit({...profileEdit, firstname: e.target.value})}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileEdit.lastname || ''}
                          onChange={(e) => setProfileEdit({...profileEdit, lastname: e.target.value})}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Display Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileEdit.display_name || ''}
                          onChange={(e) => setProfileEdit({...profileEdit, display_name: e.target.value})}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileEdit.phone || ''}
                          onChange={(e) => setProfileEdit({...profileEdit, phone: e.target.value})}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Department</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileEdit.department || ''}
                          onChange={(e) => setProfileEdit({...profileEdit, department: e.target.value})}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Bio</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={profileEdit.bio || ''}
                          onChange={(e) => setProfileEdit({...profileEdit, bio: e.target.value})}
                        />
                      </Form.Group>
                      <Button variant="primary" onClick={handleUpdateProfile} disabled={actionLoading}>
                        {actionLoading ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </Form>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>

      {/* Create Admin Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title><i className="bi bi-person-plus me-2"></i>Create New Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Username *</Form.Label>
                <Form.Control
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newAdmin.firstname}
                  onChange={(e) => setNewAdmin({...newAdmin, firstname: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newAdmin.lastname}
                  onChange={(e) => setNewAdmin({...newAdmin, lastname: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password *</Form.Label>
                <Form.Control
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role *</Form.Label>
                <Form.Select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                >
                  <option value="Admin">Admin</option>
                  <option value="SuperAdmin">SuperAdmin</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreateAdmin} disabled={actionLoading}>
            {actionLoading ? 'Creating...' : 'Create Admin'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Security Update Modal */}
      <Modal show={showSecurityModal} onHide={() => setShowSecurityModal(false)}>
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title><i className="bi bi-shield-exclamation me-2"></i>Add Security Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title *</Form.Label>
            <Form.Control
              type="text"
              value={newSecurity.title}
              onChange={(e) => setNewSecurity({...newSecurity, title: e.target.value})}
              placeholder="e.g., SQL Injection Vulnerability"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={newSecurity.description}
              onChange={(e) => setNewSecurity({...newSecurity, description: e.target.value})}
              placeholder="Describe the security issue..."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Severity</Form.Label>
            <Form.Select
              value={newSecurity.severity}
              onChange={(e) => setNewSecurity({...newSecurity, severity: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSecurityModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleCreateSecurityUpdate} disabled={actionLoading}>
            {actionLoading ? 'Creating...' : 'Add Update'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default SuperAdminDashboard;
