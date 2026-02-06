import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Badge, Tabs, Tab, Form, Alert, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UPLOADS_BASE_URL } from "../../api/axios";
import { useAuth } from "../../context/temp";
import "./superAdminDashboard.css";

function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Stats
  const [stats, setStats] = useState(null);
  
  // Users management (from Control Center)
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
  
  // Admin Dashboard data
  const [users, setUsers] = useState([]);
  const [scholarApplications, setScholarApplications] = useState([]);
  const [courseApplications, setCourseApplications] = useState([]);
  const [videos, setVideos] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [scholarsPayouts, setScholarsPayouts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [videoPrices, setVideoPrices] = useState({});
  const [bundlePrices, setBundlePrices] = useState({});
  const [pricingSearch, setPricingSearch] = useState("");
  const [expandedBundles, setExpandedBundles] = useState({});
  const [platformBalance, setPlatformBalance] = useState({ available: 0, pending: 0 });
  
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
        fetchProfile(),
        fetchAdminDashboardData()
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

  const fetchAdminDashboardData = async () => {
    try {
      // Fetch all users
      const usersRes = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/users`
      );
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

      // Fetch scholar applications
      const scholarsRes = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-profile/applications`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setScholarApplications(scholarsRes.data.applications || []);

      // Fetch course applications
      const courseAppsRes = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects/all`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCourseApplications(courseAppsRes.data.subjects || []);

      // Fetch videos
      const videosRes = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/admin/all`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setVideos(videosRes.data.videos || []);

      // Fetch transactions
      const transactionsRes = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/purchases/transactions/all`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTransactions(transactionsRes.data.transactions || []);

      // Fetch scholars payouts
      const scholarsPayoutsRes = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/scholars-status`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setScholarsPayouts(scholarsPayoutsRes.data.scholars || []);

      // Fetch platform balance
      try {
        const balanceRes = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/platform-balance`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setPlatformBalance({
          available: balanceRes.data.available?.eur || 0,
          pending: balanceRes.data.pending?.eur || 0
        });
      } catch (err) {
        console.error("Error fetching platform balance:", err);
      }

      // Fetch subjects
      const subjectsRes = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/subjects`
      );
      const subjectsList = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];
      setSubjects(subjectsList);
      const initialPrices = {};
      subjectsList.forEach(s => {
        initialPrices[s.id] = s.bundle_price || 6.00;
      });
      setBundlePrices(initialPrices);
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
    }
  };

  // ===== Control Center Actions =====
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
      fetchAdminDashboardData();
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

  // ===== Admin Dashboard Actions =====
  const handleApproveScholar = async (userId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-profile/approve`,
        { user_id: userId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Scholar application approved successfully!");
      fetchAdminDashboardData();
    } catch (err) {
      console.error("Error approving scholar:", err);
      alert("Failed to approve scholar application");
    }
  };

  const handleRejectScholar = async (userId) => {
    if (!window.confirm("Are you sure you want to reject this scholar application?")) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-profile/reject`,
        { user_id: userId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Scholar application rejected");
      fetchAdminDashboardData();
    } catch (err) {
      console.error("Error rejecting scholar:", err);
      alert("Failed to reject scholar application");
    }
  };

  const handleApproveCourse = async (applicationId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects/approve`,
        { application_id: applicationId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Course application approved successfully!");
      fetchAdminDashboardData();
    } catch (err) {
      console.error("Error approving course:", err);
      alert("Failed to approve course application");
    }
  };

  const handleRejectCourse = async (applicationId) => {
    if (!window.confirm("Are you sure you want to reject this course application?")) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects/reject`,
        { application_id: applicationId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Course application rejected");
      fetchAdminDashboardData();
    } catch (err) {
      console.error("Error rejecting course:", err);
      alert("Failed to reject course application");
    }
  };

  const handleApproveVideo = async (videoId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/${videoId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchAdminDashboardData();
    } catch (err) {
      console.error("Error approving video:", err);
      alert("Failed to approve video");
    }
  };

  const handleRejectVideo = async (videoId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/${videoId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchAdminDashboardData();
    } catch (err) {
      console.error("Error deleting video:", err);
      alert("Failed to delete video");
    }
  };

  const handleUpdateBundlePrice = async (subjectId) => {
    const newPrice = bundlePrices[subjectId];
    if (!newPrice || parseFloat(newPrice) < 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/subjects/${subjectId}/price`,
        { bundle_price: parseFloat(newPrice) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Bundle price updated successfully!");
      setSubjects(prev => prev.map(s => 
        s.id === subjectId ? { ...s, bundle_price: parseFloat(newPrice) } : s
      ));
    } catch (err) {
      console.error("Error updating bundle price:", err);
      alert("Failed to update bundle price");
    }
  };

  const handleReleaseFunds = async (scholarUserId, amount) => {
    if (!window.confirm(`Are you sure you want to release €${amount.toFixed(2)} to this scholar?`)) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/payout`,
        {
          scholarUserId,
          amount,
          currency: 'eur',
          description: `Payout from UniClips - ${new Date().toLocaleDateString()}`
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert(`Successfully released €${amount.toFixed(2)} to scholar!`);
      fetchAdminDashboardData();
    } catch (err) {
      console.error("Error releasing funds:", err);
      alert(err.response?.data?.message || "Failed to release funds.");
    }
  };

  // ===== Helper Functions =====
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

  // Calculate pending approvals
  const pendingApprovals = 
    scholarApplications.filter(s => s.approved === 0).length + 
    courseApplications.filter(c => c.approved === 0).length +
    videos.filter(v => v.approved === 0).length;

  // Calculate total revenue
  const totalRevenue = transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

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
                SuperAdmin Dashboard
              </h1>
              <p className="text-white-50 mb-0">Full system access and management</p>
            </Col>
            <Col xs="auto">
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
                    <h2 className="mb-0">{stats?.totalUsers || users.length}</h2>
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
                    <h2 className="mb-0">{videos.length}</h2>
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
                    <h2 className="mb-0">€{totalRevenue.toFixed(2)}</h2>
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
                    <h6 className="text-uppercase text-muted mb-1">Pending Approvals</h6>
                    <h2 className="mb-0">{pendingApprovals}</h2>
                  </div>
                  <div className="stat-icon">
                    <i className="bi bi-clock-history"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Content Tabs */}
        <Card className="superadmin-card">
          <Card.Body>
            <Tabs defaultActiveKey="scholars" className="superadmin-tabs mb-4">
              
              {/* Scholar Applications Tab */}
              <Tab eventKey="scholars" title={<><i className="bi bi-mortarboard me-2"></i>Scholar Applications</>}>
                <div className="table-responsive">
                  {scholarApplications.length === 0 ? (
                    <p className="text-center text-muted py-5">No scholar applications</p>
                  ) : (
                    <Table hover className="superadmin-table">
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Email</th>
                          <th>University</th>
                          <th>Degree</th>
                          <th>Year</th>
                          <th>Applied</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scholarApplications.map((app) => (
                          <tr key={app.application_id}>
                            <td>
                              <div className="d-flex align-items-center">
                                {app.profile_image_url ? (
                                  <img 
                                    src={`${UPLOADS_BASE_URL}/${app.profile_image_url}`} 
                                    alt={app.fname}
                                    className="rounded-circle me-2"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div className="rounded-circle bg-primary bg-opacity-10 me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                    <i className="bi bi-person-fill text-primary"></i>
                                  </div>
                                )}
                                <strong>{app.fname} {app.lname}</strong>
                              </div>
                            </td>
                            <td><small>{app.email}</small></td>
                            <td>{app.university}</td>
                            <td>{app.degree}</td>
                            <td>{app.year}</td>
                            <td><small>{new Date(app.created_at).toLocaleDateString()}</small></td>
                            <td>
                              {app.approved === 1 ? (
                                <Badge bg="success">Approved</Badge>
                              ) : (
                                <Badge bg="warning" text="dark">Pending</Badge>
                              )}
                            </td>
                            <td>
                              {app.approved === 0 ? (
                                <div className="d-flex gap-2">
                                  <Button size="sm" variant="success" onClick={() => handleApproveScholar(app.user_id)}>
                                    <i className="bi bi-check-lg me-1"></i>Approve
                                  </Button>
                                  <Button size="sm" variant="danger" onClick={() => handleRejectScholar(app.user_id)}>
                                    <i className="bi bi-x-lg me-1"></i>Reject
                                  </Button>
                                </div>
                              ) : (
                                <Badge bg="secondary">Completed</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Tab>

              {/* Course Applications Tab */}
              <Tab eventKey="courses" title={<><i className="bi bi-book me-2"></i>Course Applications</>}>
                <div className="table-responsive">
                  {courseApplications.length === 0 ? (
                    <p className="text-center text-muted py-5">No course applications</p>
                  ) : (
                    <Table hover className="superadmin-table">
                      <thead>
                        <tr>
                          <th>Scholar</th>
                          <th>Email</th>
                          <th>Subject</th>
                          <th>Degree</th>
                          <th>Expertise</th>
                          <th>Applied</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseApplications.map((app) => (
                          <tr key={app.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-info bg-opacity-10 me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                  <i className="bi bi-book-fill text-info"></i>
                                </div>
                                <strong>{app.fname} {app.lname}</strong>
                              </div>
                            </td>
                            <td><small>{app.email}</small></td>
                            <td><strong>{app.subject_name || `Subject #${app.subject_id}`}</strong></td>
                            <td><small>{app.degree}</small></td>
                            <td><small className="text-muted">{app.expertise?.substring(0, 50)}{app.expertise?.length > 50 ? '...' : ''}</small></td>
                            <td><small>{new Date(app.created_at).toLocaleDateString()}</small></td>
                            <td>
                              {app.approved === 1 ? (
                                <Badge bg="success">Approved</Badge>
                              ) : (
                                <Badge bg="warning" text="dark">Pending</Badge>
                              )}
                            </td>
                            <td>
                              {app.approved === 0 ? (
                                <div className="d-flex gap-2">
                                  <Button size="sm" variant="success" onClick={() => handleApproveCourse(app.id)}>
                                    <i className="bi bi-check-lg me-1"></i>Approve
                                  </Button>
                                  <Button size="sm" variant="danger" onClick={() => handleRejectCourse(app.id)}>
                                    <i className="bi bi-x-lg me-1"></i>Reject
                                  </Button>
                                </div>
                              ) : (
                                <Badge bg="secondary">Completed</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Tab>

              {/* Video Management Tab */}
              <Tab eventKey="videos" title={<><i className="bi bi-play-circle me-2"></i>Video Management</>}>
                <div>
                  {videos.length === 0 ? (
                    <p className="text-center text-muted py-5">No videos uploaded</p>
                  ) : (() => {
                    const bundles = {};
                    videos.forEach(video => {
                      const key = `${video.subject_id}-${video.scholar_user_id}`;
                      if (!bundles[key]) {
                        bundles[key] = {
                          key,
                          subjectId: video.subject_id,
                          subjectName: video.subject_name || `Subject #${video.subject_id}`,
                          scholarId: video.scholar_user_id,
                          scholarName: video.scholar_fname ? `${video.scholar_fname} ${video.scholar_lname}` : `Scholar #${video.scholar_user_id}`,
                          bundlePrice: video.bundle_price || 6,
                          videos: []
                        };
                      }
                      bundles[key].videos.push(video);
                    });

                    Object.values(bundles).forEach(bundle => {
                      bundle.videos.sort((a, b) => a.sequence_index - b.sequence_index);
                      bundle.totalVideos = bundle.videos.length;
                      bundle.approvedCount = bundle.videos.filter(v => v.approved === 1).length;
                      bundle.pendingCount = bundle.totalVideos - bundle.approvedCount;
                    });

                    return Object.values(bundles).map((bundle) => (
                      <Card key={bundle.key} className="mb-3 border">
                        <Card.Header 
                          className="d-flex justify-content-between align-items-center py-3"
                          style={{ cursor: 'pointer', background: expandedBundles[bundle.key] ? '#2d3748' : '#1a202c' }}
                          onClick={() => setExpandedBundles(prev => ({...prev, [bundle.key]: !prev[bundle.key]}))}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <i className={`bi ${expandedBundles[bundle.key] ? 'bi-chevron-down' : 'bi-chevron-right'} fs-5 text-white`}></i>
                            <div>
                              <h6 className="mb-0 fw-bold text-white">
                                <i className="bi bi-collection-play me-2 text-primary"></i>
                                {bundle.subjectName}
                              </h6>
                              <small className="text-white-50">by {bundle.scholarName} • €{bundle.bundlePrice}/bundle</small>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-3">
                            <Badge bg="secondary" className="px-3 py-2">{bundle.totalVideos} video{bundle.totalVideos !== 1 ? 's' : ''}</Badge>
                            {bundle.pendingCount > 0 && <Badge bg="warning" text="dark" className="px-3 py-2">{bundle.pendingCount} pending</Badge>}
                            {bundle.approvedCount === bundle.totalVideos && <Badge bg="success" className="px-3 py-2">All Published</Badge>}
                          </div>
                        </Card.Header>
                        {expandedBundles[bundle.key] && (
                          <Card.Body className="p-0" style={{ background: '#2d3748' }}>
                            <Table hover className="mb-0 superadmin-table">
                              <thead>
                                <tr>
                                  <th style={{ width: '60px' }}>#</th>
                                  <th>Video Title</th>
                                  <th style={{ width: '100px' }}>Sequence</th>
                                  <th style={{ width: '120px' }}>Status</th>
                                  <th style={{ width: '200px' }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bundle.videos.map((video) => (
                                  <tr key={video.id}>
                                    <td className="text-muted">#{video.id}</td>
                                    <td>
                                      {video.title}
                                      {video.sequence_index === 1 && <Badge bg="info" className="ms-2">Free Preview</Badge>}
                                    </td>
                                    <td><Badge bg="light" text="dark">{video.sequence_index}</Badge></td>
                                    <td>
                                      {video.approved === 1 ? <Badge bg="success">Published</Badge> : <Badge bg="warning" text="dark">Pending</Badge>}
                                    </td>
                                    <td>
                                      <div className="d-flex gap-2">
                                        {video.approved !== 1 && (
                                          <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleApproveVideo(video.id); }}>
                                            <i className="bi bi-check-lg me-1"></i>Approve
                                          </Button>
                                        )}
                                        <Button size="sm" variant="outline-danger" onClick={(e) => {
                                          e.stopPropagation();
                                          if (window.confirm(`Delete "${video.title}"?`)) handleRejectVideo(video.id);
                                        }}>
                                          <i className="bi bi-trash"></i>
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                            {bundle.pendingCount > 0 && (
                              <div className="p-3 border-top" style={{ background: '#1a202c' }}>
                                <Button variant="success" onClick={() => {
                                  if (window.confirm(`Approve all ${bundle.pendingCount} pending videos?`)) {
                                    bundle.videos.filter(v => v.approved !== 1).forEach(v => handleApproveVideo(v.id));
                                  }
                                }}>
                                  <i className="bi bi-check-all me-2"></i>Approve All Pending ({bundle.pendingCount})
                                </Button>
                              </div>
                            )}
                          </Card.Body>
                        )}
                      </Card>
                    ));
                  })()}
                </div>
              </Tab>

              {/* User Management Tab (with Role Control) */}
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

              {/* Transactions Tab */}
              <Tab eventKey="transactions" title={<><i className="bi bi-receipt me-2"></i>Transactions</>}>
                <div className="table-responsive">
                  {transactions.length === 0 ? (
                    <p className="text-center text-muted py-5">No transactions found</p>
                  ) : (
                    <>
                      <Table hover className="superadmin-table">
                        <thead>
                          <tr>
                            <th>Transaction ID</th>
                            <th>Date</th>
                            <th>Buyer</th>
                            <th>Video</th>
                            <th>Scholar</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((t) => (
                            <tr key={t.transaction_id}>
                              <td><small className="text-muted">#{t.transaction_id}</small></td>
                              <td>
                                <small>{new Date(t.transaction_date).toLocaleDateString()}</small><br />
                                <small className="text-muted">{new Date(t.transaction_date).toLocaleTimeString()}</small>
                              </td>
                              <td>
                                <small className="fw-bold">{t.buyer_fname} {t.buyer_lname}</small><br />
                                <small className="text-muted">{t.buyer_email}</small>
                              </td>
                              <td><small>{t.video_title || `Video #${t.video_id}`}</small></td>
                              <td><small>{t.scholar_fname} {t.scholar_lname}</small></td>
                              <td><strong className="text-success">€{parseFloat(t.amount || 0).toFixed(2)}</strong></td>
                              <td>
                                {t.status === 'succeeded' || t.status === 'completed' ? (
                                  <Badge bg="success">Success</Badge>
                                ) : t.status === 'pending' ? (
                                  <Badge bg="warning" text="dark">Pending</Badge>
                                ) : (
                                  <Badge bg="secondary">{t.status}</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      <div className="mt-3 p-3 rounded" style={{ background: '#2d3748' }}>
                        <Row>
                          <Col md={4} className="text-center">
                            <p className="text-muted mb-1 small">Total Transactions</p>
                            <h5 className="mb-0 fw-bold text-white">{transactions.length}</h5>
                          </Col>
                          <Col md={4} className="text-center">
                            <p className="text-muted mb-1 small">Total Revenue</p>
                            <h5 className="mb-0 fw-bold text-success">€{totalRevenue.toFixed(2)}</h5>
                          </Col>
                          <Col md={4} className="text-center">
                            <p className="text-muted mb-1 small">Successful</p>
                            <h5 className="mb-0 fw-bold text-white">{transactions.filter(t => t.status === 'succeeded' || t.status === 'completed').length}</h5>
                          </Col>
                        </Row>
                      </div>
                    </>
                  )}
                </div>
              </Tab>

              {/* Payouts Management Tab */}
              <Tab eventKey="payouts" title={<><i className="bi bi-wallet2 me-2"></i>Payouts</>}>
                <Alert variant="info" className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Platform Balance:</strong>{' '}
                      <span className="text-success">€{platformBalance.available.toFixed(2)} available</span>
                      {platformBalance.pending > 0 && (
                        <span className="text-muted ms-2">(€{platformBalance.pending.toFixed(2)} pending)</span>
                      )}
                    </div>
                  </div>
                </Alert>
                
                <Table hover className="superadmin-table">
                  <thead>
                    <tr>
                      <th>Scholar</th>
                      <th>Country</th>
                      <th>Stripe Status</th>
                      <th>Pending (EUR)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scholarsPayouts.map((scholar) => {
                      const pendingAmount = parseFloat(scholar.pendingBalance) || 0;
                      const canPayout = pendingAmount > 0 && platformBalance.available >= pendingAmount;
                      
                      return (
                        <tr key={scholar.id}>
                          <td>
                            <strong>{scholar.fname} {scholar.lname}</strong><br />
                            <small className="text-muted">{scholar.email}</small>
                          </td>
                          <td>{scholar.country || 'Finland'}</td>
                          <td>
                            {scholar.stripeStatus === 'Linked' ? (
                              <Badge bg="success">Linked</Badge>
                            ) : scholar.stripeStatus === 'Action Required' ? (
                              <Badge bg="warning" text="dark">Action Required</Badge>
                            ) : (
                              <Badge bg="secondary">{scholar.stripeStatus}</Badge>
                            )}
                          </td>
                          <td><strong className="text-primary">€{scholar.pendingBalance || '0.00'}</strong></td>
                          <td>
                            {scholar.payoutsEnabled && canPayout ? (
                              <Button size="sm" variant="success" onClick={() => handleReleaseFunds(scholar.id, pendingAmount)}>
                                Release €{pendingAmount.toFixed(2)}
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline-secondary" disabled>
                                {pendingAmount > 0 ? 'Funds Pending' : 'No Balance'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Tab>

              {/* Course Pricing Tab */}
              <Tab eventKey="pricing" title={<><i className="bi bi-currency-euro me-2"></i>Course Pricing</>}>
                <div className="p-3">
                  <h5 className="mb-3 text-white"><i className="bi bi-currency-euro me-2 text-success"></i>Course Bundle Pricing</h5>
                  <p className="text-muted mb-4">Set the bundle price for each subject.</p>
                  
                  <Form.Group className="mb-4">
                    <Form.Control
                      type="text"
                      placeholder="Search by subject name or degree programme..."
                      value={pricingSearch}
                      onChange={(e) => setPricingSearch(e.target.value)}
                    />
                  </Form.Group>
                  
                  <Table responsive hover className="superadmin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Subject Name</th>
                        <th>Degree Programme</th>
                        <th>Current Price (€)</th>
                        <th>New Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.filter(s => 
                        s.name.toLowerCase().includes(pricingSearch.toLowerCase()) ||
                        (s.degree_programmes && s.degree_programmes.toLowerCase().includes(pricingSearch.toLowerCase()))
                      ).map(subject => (
                        <tr key={subject.id}>
                          <td>{subject.id}</td>
                          <td><strong>{subject.name}</strong></td>
                          <td><Badge bg="secondary">{subject.degree_programmes || 'Not specified'}</Badge></td>
                          <td><Badge bg="success" className="fs-6">€{parseFloat(subject.bundle_price || 6.00).toFixed(2)}</Badge></td>
                          <td style={{ width: '150px' }}>
                            <Form.Control
                              type="number"
                              step="0.01"
                              min="0"
                              value={bundlePrices[subject.id] || ''}
                              onChange={(e) => setBundlePrices(prev => ({...prev, [subject.id]: e.target.value}))}
                              placeholder="€0.00"
                              size="sm"
                            />
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleUpdateBundlePrice(subject.id)}
                              disabled={!bundlePrices[subject.id] || parseFloat(bundlePrices[subject.id]) === parseFloat(subject.bundle_price || 6.00)}
                            >
                              <i className="bi bi-check-lg me-1"></i>Update
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Tab>

              {/* Security Updates Tab */}
              <Tab eventKey="security" title={<><i className="bi bi-shield-check me-2"></i>Security</>}>
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
                        <td><Badge bg="dark">{log.action}</Badge></td>
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
                <Form.Control type="text" value={newAdmin.username} onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})} required />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" value={newAdmin.firstname} onChange={(e) => setNewAdmin({...newAdmin, firstname: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" value={newAdmin.lastname} onChange={(e) => setNewAdmin({...newAdmin, lastname: e.target.value})} />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password *</Form.Label>
                <Form.Control type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role *</Form.Label>
                <Form.Select value={newAdmin.role} onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}>
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
            <Form.Control type="text" value={newSecurity.title} onChange={(e) => setNewSecurity({...newSecurity, title: e.target.value})} placeholder="e.g., SQL Injection Vulnerability" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} value={newSecurity.description} onChange={(e) => setNewSecurity({...newSecurity, description: e.target.value})} placeholder="Describe the security issue..." />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Severity</Form.Label>
            <Form.Select value={newSecurity.severity} onChange={(e) => setNewSecurity({...newSecurity, severity: e.target.value})}>
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
