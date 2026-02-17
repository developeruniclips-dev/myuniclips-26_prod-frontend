import React, { useState, useEffect } from "react";
import { Container, Row, Col, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UPLOADS_BASE_URL } from "../../api/axios";
import { useAuth } from "../../context/temp";
import "./superAdminDashboard.css";

// Inline expandable text component for expertise
const ExpertiseText = ({ text, maxLength = 50 }) => {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > maxLength;
  
  return (
    <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
      <span style={{ color: '#475569' }}>
        {expanded || !needsTruncation ? text : `${text.substring(0, maxLength)}...`}
      </span>
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: '#6366f1',
            cursor: 'pointer',
            padding: '0 4px',
            fontSize: '0.8rem',
            fontWeight: '500',
            marginLeft: '4px'
          }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Data states
  const [allUsers, setAllUsers] = useState([]);
  const [scholarApplications, setScholarApplications] = useState([]);
  const [courseApplications, setCourseApplications] = useState([]);
  const [videos, setVideos] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [scholarsPayouts, setScholarsPayouts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [securityUpdates, setSecurityUpdates] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [profile, setProfile] = useState(null);
  const [platformBalance, setPlatformBalance] = useState({ available: 0, pending: 0 });
  const [orphanedUsers, setOrphanedUsers] = useState([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState('scholars');
  const [userSearch, setUserSearch] = useState("");
  const [pricingSearch, setPricingSearch] = useState("");
  const [expandedBundles, setExpandedBundles] = useState({});
  const [bundlePrices, setBundlePrices] = useState({});
  const [profileEdit, setProfileEdit] = useState({});
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '', firstname: '', lastname: '', role: 'Admin' });
  const [newSecurity, setNewSecurity] = useState({ title: '', description: '', severity: 'medium' });
  
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
        fetchUsers(),
        fetchScholarApplications(),
        fetchCourseApplications(),
        fetchVideos(),
        fetchTransactions(),
        fetchPayouts(),
        fetchSubjects(),
        fetchSecurityUpdates(),
        fetchActivityLog(),
        fetchProfile(),
        fetchOrphanedUsers()
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/users`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // Map the data to ensure consistent property names
      const usersData = (res.data || []).map(u => ({
        ...u,
        username: u.username || `${u.fname || ''} ${u.lname || ''}`.trim() || u.email,
        firstname: u.firstname || u.fname,
        lastname: u.lastname || u.lname
      }));
      setAllUsers(usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchScholarApplications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-profile/applications`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setScholarApplications(res.data.applications || []);
    } catch (err) {
      console.error("Error fetching scholar applications:", err);
    }
  };

  const fetchCourseApplications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects/all`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCourseApplications(res.data.subjects || []);
    } catch (err) {
      console.error("Error fetching course applications:", err);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/admin/all`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setVideos(res.data.videos || []);
    } catch (err) {
      console.error("Error fetching videos:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/purchases/transactions/all`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchPayouts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/scholars-status`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setScholarsPayouts(res.data.scholars || []);
      
      // Also fetch platform balance
      const balanceRes = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/platform-balance`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setPlatformBalance({
        available: balanceRes.data.available?.eur || 0,
        pending: balanceRes.data.pending?.eur || 0
      });
    } catch (err) {
      console.error("Error fetching payouts:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/subjects`);
      const subjectsList = res.data || [];
      setSubjects(subjectsList);
      const prices = {};
      subjectsList.forEach(s => { prices[s.id] = s.bundle_price || 6.00; });
      setBundlePrices(prices);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const fetchSecurityUpdates = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/security-updates`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSecurityUpdates(res.data || []);
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
      setActivityLog(res.data || []);
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

  const fetchOrphanedUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/users/orphaned`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setOrphanedUsers(res.data.orphanedUsers || []);
    } catch (err) {
      console.error("Error fetching orphaned users:", err);
    }
  };

  // ===== Action Handlers =====
  const handleCleanupOrphaned = async (userId) => {
    if (!window.confirm(`Permanently remove all leftover data for previous user #${userId}? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/users/orphaned/${userId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Orphaned data cleaned up successfully");
      setOrphanedUsers(prev => prev.filter(u => u.user_id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to clean up orphaned data");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveScholar = async (userId) => {
    setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-profile/approve`,
        { user_id: userId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Scholar approved successfully!");
      fetchScholarApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve scholar");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectScholar = async (userId) => {
    if (!window.confirm("Reject this scholar application?")) return;
    setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-profile/reject`,
        { user_id: userId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Scholar rejected");
      fetchScholarApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject scholar");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveCourse = async (applicationId) => {
    setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects/approve`,
        { application_id: applicationId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Course approved!");
      fetchCourseApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve course");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCourse = async (applicationId) => {
    if (!window.confirm("Reject this course application?")) return;
    setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects/reject`,
        { application_id: applicationId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Course rejected");
      fetchCourseApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject course");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveVideo = async (videoId) => {
    setActionLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/${videoId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchVideos();
    } catch (err) {
      alert("Failed to approve video");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    setActionLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/${videoId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchVideos();
    } catch (err) {
      alert("Failed to delete video");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (!window.confirm(`Change role to ${newRole}?`)) return;
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
    if (!window.confirm(`Delete user ${email}? This cannot be undone!`)) return;
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

  const handleCreateAdmin = async () => {
    if (!newAdmin.username || !newAdmin.email || !newAdmin.password) {
      alert("Please fill required fields");
      return;
    }
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

  const handleUpdateBundlePrice = async (subjectId) => {
    const newPrice = bundlePrices[subjectId];
    if (!newPrice || parseFloat(newPrice) < 0) {
      alert("Enter a valid price");
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/subjects/${subjectId}/price`,
        { bundlePrice: parseFloat(newPrice) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Price updated!");
      fetchSubjects();
    } catch (err) {
      alert("Failed to update price");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseFunds = async (scholarUserId, amount) => {
    if (!window.confirm(`Release €${amount.toFixed(2)} to this scholar?`)) return;
    setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/payout`,
        { scholarUserId, amount, currency: 'eur', description: `Payout - ${new Date().toLocaleDateString()}` },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert(`Released €${amount.toFixed(2)}!`);
      fetchPayouts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to release funds");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSecurityUpdate = async () => {
    if (!newSecurity.title) {
      alert("Title is required");
      return;
    }
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
      alert(err.response?.data?.message || "Failed to create");
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
    } catch (err) {
      alert("Failed to update status");
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
      alert("Profile updated!");
      fetchProfile();
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setActionLoading(false);
    }
  };

  // ===== Helper Functions =====
  const filteredUsers = allUsers.filter(u => 
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.roles?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const pendingScholars = scholarApplications.filter(s => s.approved === 0).length;
  const pendingCourses = courseApplications.filter(c => c.approved === 0).length;
  const pendingVideos = videos.filter(v => v.approved === 0).length;
  const totalRevenue = transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const getRoleBadgeClass = (roles) => {
    if (!roles) return 'learner';
    const roleStr = String(roles).toLowerCase();
    if (roleStr.includes('superadmin')) return 'superadmin';
    if (roleStr.includes('admin')) return 'admin';
    if (roleStr.includes('scholar')) return 'scholar';
    return 'learner';
  };

  const getRoleIcon = (roles) => {
    if (!roles) return '📚';
    const roleStr = String(roles).toLowerCase();
    if (roleStr.includes('superadmin')) return '🛡️';
    if (roleStr.includes('admin')) return '👤';
    if (roleStr.includes('scholar')) return '🎓';
    return '📚';
  };

  const getPrimaryRole = (roles) => {
    if (!roles) return 'Learner';
    const roleStr = String(roles);
    if (roleStr.includes('SuperAdmin')) return 'SuperAdmin';
    if (roleStr.includes('Admin')) return 'Admin';
    if (roleStr.includes('Scholar')) return 'Scholar';
    return 'Learner';
  };

  // Video bundles
  const getVideoBundles = () => {
    const bundles = {};
    videos.forEach(video => {
      const key = `${video.subject_id}-${video.scholar_user_id}`;
      if (!bundles[key]) {
        bundles[key] = {
          key,
          subjectName: video.subject_name || `Subject #${video.subject_id}`,
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
    return Object.values(bundles);
  };

  const tabs = [
    { key: 'scholars', label: 'Scholars', icon: 'bi-mortarboard', badge: pendingScholars },
    { key: 'courses', label: 'Courses', icon: 'bi-book', badge: pendingCourses },
    { key: 'videos', label: 'Videos', icon: 'bi-play-circle', badge: pendingVideos },
    { key: 'users', label: 'Users', icon: 'bi-people' },
    { key: 'previous-users', label: 'Previous Users', icon: 'bi-person-x', badge: orphanedUsers.length },
    { key: 'transactions', label: 'Transactions', icon: 'bi-receipt' },
    { key: 'payouts', label: 'Payouts', icon: 'bi-wallet2' },
    { key: 'pricing', label: 'Pricing', icon: 'bi-currency-euro' },
    { key: 'security', label: 'Security', icon: 'bi-shield-check' },
    { key: 'activity', label: 'Activity', icon: 'bi-clock-history' },
    { key: 'profile', label: 'Profile', icon: 'bi-person-gear' },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard">
      {/* Header */}
      <div className="superadmin-header">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1><i className="bi bi-shield-lock-fill me-2"></i>SuperAdmin Dashboard</h1>
              <p className="subtitle mb-0">
                Welcome back, <strong>{profile?.display_name || profile?.firstname || user?.email?.split('@')[0] || 'Admin'}</strong> — Full system control
              </p>
            </div>
            <button 
              className="btn-action outline"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
              onClick={() => { if(window.confirm('Logout?')) { logout(); navigate('/login'); } }}
            >
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users"><i className="bi bi-people-fill"></i></div>
            <div>
              <p className="stat-label">Total Users</p>
              <h3 className="stat-value">{allUsers.length}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon videos"><i className="bi bi-play-circle-fill"></i></div>
            <div>
              <p className="stat-label">Total Videos</p>
              <h3 className="stat-value">{videos.length}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon revenue"><i className="bi bi-currency-euro"></i></div>
            <div>
              <p className="stat-label">Total Revenue</p>
              <h3 className="stat-value">€{totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending"><i className="bi bi-clock-history"></i></div>
            <div>
              <p className="stat-label">Pending</p>
              <h3 className="stat-value">{pendingScholars + pendingCourses + pendingVideos}</h3>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="main-card">
          {/* Tabs */}
          <nav className="superadmin-tabs nav nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <i className={`bi ${tab.icon}`}></i>
                <span>{tab.label}</span>
                {tab.badge > 0 && <span className="status-badge warning ms-2">{tab.badge}</span>}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="tab-content-area">
            
            {/* Scholar Applications */}
            {activeTab === 'scholars' && (
              <div>
                {scholarApplications.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-mortarboard"></i>
                    <p>No scholar applications yet</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>University</th>
                          <th>Degree</th>
                          <th>Year</th>
                          <th>Applied</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scholarApplications.map(app => (
                          <tr key={app.application_id}>
                            <td>
                              <div className="user-info-cell">
                                <div className={`user-avatar ${app.profile_image_url ? '' : 'purple'}`}>
                                  {app.profile_image_url ? (
                                    <img src={`${UPLOADS_BASE_URL}/${app.profile_image_url}`} alt="" />
                                  ) : (
                                    <i className="bi bi-person-fill"></i>
                                  )}
                                </div>
                                <div className="user-details">
                                  <div className="user-name">{app.fname} {app.lname}</div>
                                  <div className="user-email">{app.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>{app.university}</td>
                            <td>{app.degree}</td>
                            <td>{app.year}</td>
                            <td>{new Date(app.created_at).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge ${app.approved === 1 ? 'success' : 'warning'}`}>
                                {app.approved === 1 ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td>
                              {app.approved === 0 ? (
                                <div className="action-buttons">
                                  <button className="btn-action approve" onClick={() => handleApproveScholar(app.user_id)} disabled={actionLoading}>
                                    <i className="bi bi-check-lg"></i> Approve
                                  </button>
                                  <button className="btn-action reject" onClick={() => handleRejectScholar(app.user_id)} disabled={actionLoading}>
                                    <i className="bi bi-x-lg"></i> Reject
                                  </button>
                                </div>
                              ) : app.stripe_onboarding_complete ? (
                                <span className="status-badge success">
                                  <i className="bi bi-check-circle me-1"></i>Stripe Connected
                                </span>
                              ) : app.stripe_account_id ? (
                                <span className="status-badge warning">
                                  <i className="bi bi-exclamation-triangle me-1"></i>Stripe Incomplete
                                </span>
                              ) : (
                                <span className="status-badge secondary">
                                  <i className="bi bi-clock me-1"></i>Awaiting Stripe
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Course Applications */}
            {activeTab === 'courses' && (
              <div>
                {courseApplications.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-book"></i>
                    <p>No course applications yet</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Scholar</th>
                          <th>Subject</th>
                          <th>Expertise</th>
                          <th>Degree</th>
                          <th>Applied</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseApplications.map(app => (
                          <tr key={app.id}>
                            <td>
                              <div className="user-info-cell">
                                <div className="user-avatar blue">
                                  <i className="bi bi-book-fill"></i>
                                </div>
                                <div className="user-details">
                                  <div className="user-name">{app.fname} {app.lname}</div>
                                  <div className="user-email">{app.email}</div>
                                </div>
                              </div>
                            </td>
                            <td><strong>{app.subject_name || `Subject #${app.subject_id}`}</strong></td>
                            <td style={{ maxWidth: '250px' }}>
                              {app.expertise ? (
                                <ExpertiseText text={app.expertise} />
                              ) : (
                                <span className="text-muted">No expertise provided</span>
                              )}
                            </td>
                            <td>{app.degree}</td>
                            <td>{new Date(app.created_at).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge ${app.approved === 1 ? 'success' : 'warning'}`}>
                                {app.approved === 1 ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td>
                              {app.approved === 0 ? (
                                <div className="action-buttons">
                                  <button className="btn-action approve" onClick={() => handleApproveCourse(app.id)} disabled={actionLoading}>
                                    <i className="bi bi-check-lg"></i> Approve
                                  </button>
                                  <button className="btn-action reject" onClick={() => handleRejectCourse(app.id)} disabled={actionLoading}>
                                    <i className="bi bi-x-lg"></i> Reject
                                  </button>
                                </div>
                              ) : app.video_count > 0 ? (
                                <span className="status-badge success">
                                  <i className="bi bi-camera-video me-1"></i>{app.approved_video_count}/{app.video_count} Videos
                                </span>
                              ) : (
                                <span className="status-badge warning">
                                  <i className="bi bi-upload me-1"></i>No Videos Yet
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Videos */}
            {activeTab === 'videos' && (
              <div>
                {videos.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-play-circle"></i>
                    <p>No videos uploaded yet</p>
                  </div>
                ) : (
                  getVideoBundles().map(bundle => (
                    <div key={bundle.key} className="bundle-card">
                      <div 
                        className="bundle-header"
                        onClick={() => setExpandedBundles(prev => ({...prev, [bundle.key]: !prev[bundle.key]}))}
                      >
                        <div className="bundle-info">
                          <i className={`bi bi-chevron-right chevron ${expandedBundles[bundle.key] ? 'expanded' : ''}`}></i>
                          <div>
                            <h6 className="bundle-title">
                              <i className="bi bi-collection-play me-2" style={{color: '#4f46e5'}}></i>
                              {bundle.subjectName}
                            </h6>
                            <p className="bundle-subtitle">by {bundle.scholarName} • €{bundle.bundlePrice}/bundle</p>
                          </div>
                        </div>
                        <div className="bundle-badges">
                          <span className="status-badge secondary">{bundle.totalVideos} videos</span>
                          {bundle.pendingCount > 0 && <span className="status-badge warning">{bundle.pendingCount} pending</span>}
                          {bundle.approvedCount === bundle.totalVideos && <span className="status-badge success">All Published</span>}
                        </div>
                      </div>
                      {expandedBundles[bundle.key] && (
                        <div className="bundle-content">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th style={{width: '60px'}}>#</th>
                                <th>Title</th>
                                <th style={{width: '100px'}}>Sequence</th>
                                <th style={{width: '120px'}}>Status</th>
                                <th style={{width: '180px'}}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bundle.videos.map(video => (
                                <tr key={video.id}>
                                  <td style={{color: '#94a3b8'}}>#{video.id}</td>
                                  <td>
                                    {video.title}
                                    {video.sequence_index === 1 && <span className="status-badge info ms-2">Free Preview</span>}
                                  </td>
                                  <td><span className="status-badge secondary">{video.sequence_index}</span></td>
                                  <td>
                                    <span className={`status-badge ${video.approved === 1 ? 'success' : 'warning'}`}>
                                      {video.approved === 1 ? 'Published' : 'Pending'}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="action-buttons">
                                      {video.approved !== 1 && (
                                        <button className="btn-action approve" onClick={(e) => { e.stopPropagation(); handleApproveVideo(video.id); }} disabled={actionLoading}>
                                          <i className="bi bi-check-lg"></i>
                                        </button>
                                      )}
                                      <button className="btn-action outline-danger" onClick={(e) => { e.stopPropagation(); handleDeleteVideo(video.id, video.title); }} disabled={actionLoading}>
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {bundle.pendingCount > 0 && (
                            <div className="bundle-footer">
                              <button 
                                className="btn-action approve"
                                onClick={() => {
                                  if (window.confirm(`Approve all ${bundle.pendingCount} pending videos?`)) {
                                    bundle.videos.filter(v => v.approved !== 1).forEach(v => handleApproveVideo(v.id));
                                  }
                                }}
                              >
                                <i className="bi bi-check-all me-2"></i>Approve All ({bundle.pendingCount})
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div>
                <div className="toolbar">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name, email, or role..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  <button className="btn-action primary" onClick={() => setShowCreateModal(true)}>
                    <i className="bi bi-plus-circle me-2"></i>Create Admin
                  </button>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td style={{color: '#94a3b8'}}>{u.id}</td>
                          <td>
                            <div className="user-info-cell">
                              <div className={`user-avatar ${getRoleBadgeClass(u.roles)}`}>
                                {getRoleIcon(u.roles)}
                              </div>
                              <div className="user-details">
                                <div className="user-name">{u.username}</div>
                                <div className="user-email">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`role-badge ${getRoleBadgeClass(u.roles)}`}>
                              {getRoleIcon(u.roles)} {getPrimaryRole(u.roles)}
                            </span>
                          </td>
                          <td>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <select
                                className="role-select"
                                value={getPrimaryRole(u.roles)}
                                onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                disabled={u.id === user.id}
                              >
                                <option value="Learner">Learner</option>
                                <option value="Scholar">Scholar</option>
                                <option value="Admin">Admin</option>
                                <option value="SuperAdmin">SuperAdmin</option>
                              </select>
                              <button
                                className="btn-action outline-danger"
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                disabled={u.id === user.id}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Previous Users */}
            {activeTab === 'previous-users' && (
              <div>
                {orphanedUsers.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-person-x"></i>
                    <p>No previous users with leftover data</p>
                  </div>
                ) : (
                  <>
                    <div className="alert-banner" style={{ background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#856404', fontSize: '0.9rem' }}>
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      <strong>Previous Users:</strong> These users were deleted but still have leftover data (roles, scholar profiles, videos, etc.) in the database. Use cleanup to remove orphaned records.
                    </div>
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Roles</th>
                            <th>Scholar Status</th>
                            <th>Videos</th>
                            <th>Subjects</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orphanedUsers.map(u => (
                            <tr key={u.user_id}>
                              <td style={{color: '#94a3b8'}}>{u.user_id}</td>
                              <td>
                                <div className="user-info-cell">
                                  <div className="user-avatar" style={{background: 'linear-gradient(135deg, #94a3b8, #64748b)'}}>
                                    <i className="bi bi-person-x"></i>
                                  </div>
                                  <div className="user-details">
                                    <div className="user-name">{u.full_name || 'Deleted User'}</div>
                                    <div className="user-email" style={{color: '#94a3b8'}}>Account deleted</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {u.roles ? u.roles.split(',').map((role, i) => (
                                  <span key={i} className={`role-badge ${role.trim().toLowerCase()}`} style={{marginRight: '4px'}}>
                                    {role.trim()}
                                  </span>
                                )) : <span style={{color: '#94a3b8'}}>None</span>}
                              </td>
                              <td>
                                {u.approved === 1 ? (
                                  <span className="status-badge success">Approved</span>
                                ) : u.application_status === 'pending' ? (
                                  <span className="status-badge warning">Pending</span>
                                ) : u.application_status ? (
                                  <span className="status-badge info">{u.application_status}</span>
                                ) : (
                                  <span style={{color: '#94a3b8'}}>N/A</span>
                                )}
                              </td>
                              <td>
                                {u.video_count ? (
                                  <span className="status-badge info">{u.video_count} video{u.video_count !== 1 ? 's' : ''}</span>
                                ) : <span style={{color: '#94a3b8'}}>0</span>}
                              </td>
                              <td>
                                {u.subjects && u.subjects.length > 0 ? (
                                  u.subjects.map((s, i) => (
                                    <span key={i} className={`status-badge ${s.approved ? 'success' : 'secondary'}`} style={{marginRight: '4px'}} title={s.expertise}>
                                      {s.subject_name || `#${s.subject_id}`}
                                    </span>
                                  ))
                                ) : <span style={{color: '#94a3b8'}}>None</span>}
                              </td>
                              <td>
                                <button
                                  className="btn-action outline-danger"
                                  onClick={() => handleCleanupOrphaned(u.user_id)}
                                  disabled={actionLoading}
                                  title="Remove all leftover data"
                                >
                                  <i className="bi bi-trash me-1"></i> Cleanup
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Transactions */}
            {activeTab === 'transactions' && (
              <div>
                {transactions.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-receipt"></i>
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <>
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Buyer</th>
                            <th>Item</th>
                            <th>Scholar</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map(t => (
                            <tr key={t.transaction_id}>
                              <td style={{color: '#94a3b8'}}>#{t.transaction_id}</td>
                              <td>{new Date(t.transaction_date).toLocaleDateString()}</td>
                              <td>
                                <div className="user-details">
                                  <div className="user-name">{t.buyer_fname} {t.buyer_lname}</div>
                                  <div className="user-email">{t.buyer_email}</div>
                                </div>
                              </td>
                              <td>{t.video_title || `Video #${t.video_id}`}</td>
                              <td>{t.scholar_fname} {t.scholar_lname}</td>
                              <td><strong style={{color: '#059669'}}>€{parseFloat(t.amount || 0).toFixed(2)}</strong></td>
                              <td>
                                <span className={`status-badge ${t.status === 'succeeded' || t.status === 'completed' ? 'success' : t.status === 'pending' ? 'warning' : 'secondary'}`}>
                                  {t.status === 'succeeded' || t.status === 'completed' ? 'Success' : t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="summary-box">
                      <div className="summary-item">
                        <p className="summary-label">Total Transactions</p>
                        <p className="summary-value">{transactions.length}</p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-label">Total Revenue</p>
                        <p className="summary-value success">€{totalRevenue.toFixed(2)}</p>
                      </div>
                      <div className="summary-item">
                        <p className="summary-label">Successful</p>
                        <p className="summary-value">{transactions.filter(t => t.status === 'succeeded' || t.status === 'completed').length}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Payouts */}
            {activeTab === 'payouts' && (
              <div>
                <div className="info-alert">
                  <i className="bi bi-info-circle alert-icon"></i>
                  <span className="alert-text">
                    <strong>Platform Balance:</strong>{' '}
                    <span className="alert-value">€{platformBalance.available.toFixed(2)} available</span>
                    {platformBalance.pending > 0 && ` (€${platformBalance.pending.toFixed(2)} pending)`}
                  </span>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Scholar</th>
                        <th>Country</th>
                        <th>Stripe Status</th>
                        <th>Pending</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scholarsPayouts.map(scholar => {
                        const pendingAmount = parseFloat(scholar.pendingBalance) || 0;
                        const canPayout = pendingAmount > 0 && platformBalance.available >= pendingAmount && scholar.payoutsEnabled;
                        return (
                          <tr key={scholar.id}>
                            <td>
                              <div className="user-details">
                                <div className="user-name">{scholar.fname} {scholar.lname}</div>
                                <div className="user-email">{scholar.email}</div>
                              </div>
                            </td>
                            <td>{scholar.country || 'Finland'}</td>
                            <td>
                              <span className={`status-badge ${scholar.stripeStatus === 'Linked' ? 'success' : scholar.stripeStatus === 'Action Required' ? 'warning' : 'secondary'}`}>
                                {scholar.stripeStatus}
                              </span>
                            </td>
                            <td><strong style={{color: '#4f46e5'}}>€{scholar.pendingBalance || '0.00'}</strong></td>
                            <td>
                              {canPayout ? (
                                <button className="btn-action approve" onClick={() => handleReleaseFunds(scholar.id, pendingAmount)} disabled={actionLoading}>
                                  Release €{pendingAmount.toFixed(2)}
                                </button>
                              ) : (
                                <button className="btn-action outline" disabled>
                                  {pendingAmount > 0 ? 'Not Ready' : 'No Balance'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pricing */}
            {activeTab === 'pricing' && (
              <div>
                <div className="toolbar">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search subjects..."
                    value={pricingSearch}
                    onChange={(e) => setPricingSearch(e.target.value)}
                  />
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Degree</th>
                        <th>Current Price</th>
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
                          <td style={{color: '#94a3b8'}}>{subject.id}</td>
                          <td><strong>{subject.name}</strong></td>
                          <td><span className="status-badge secondary">{subject.degree_programmes || 'N/A'}</span></td>
                          <td><span className="status-badge success">€{parseFloat(subject.bundle_price || 6.00).toFixed(2)}</span></td>
                          <td style={{width: '130px'}}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="form-input"
                              value={bundlePrices[subject.id] || ''}
                              onChange={(e) => setBundlePrices(prev => ({...prev, [subject.id]: e.target.value}))}
                              placeholder="€0.00"
                              style={{padding: '0.4rem 0.6rem', fontSize: '0.85rem'}}
                            />
                          </td>
                          <td>
                            <button
                              className="btn-action primary"
                              onClick={() => handleUpdateBundlePrice(subject.id)}
                              disabled={!bundlePrices[subject.id] || parseFloat(bundlePrices[subject.id]) === parseFloat(subject.bundle_price || 6.00) || actionLoading}
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div>
                <div className="toolbar">
                  <div></div>
                  <button className="btn-action primary" onClick={() => setShowSecurityModal(true)}>
                    <i className="bi bi-plus-circle me-2"></i>Add Update
                  </button>
                </div>
                {securityUpdates.length === 0 ? (
                  <div className="info-alert" style={{background: '#d1fae5', border: '1px solid #a7f3d0'}}>
                    <i className="bi bi-check-circle" style={{color: '#059669'}}></i>
                    <span style={{color: '#065f46'}}>No security issues. System is secure!</span>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Severity</th>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securityUpdates.map(su => (
                          <tr key={su.id}>
                            <td>
                              <span className={`status-badge ${su.severity === 'critical' ? 'danger' : su.severity === 'high' ? 'warning' : su.severity === 'medium' ? 'info' : 'secondary'}`}>
                                {su.severity?.toUpperCase()}
                              </span>
                            </td>
                            <td><strong>{su.title}</strong></td>
                            <td>
                              <span className={`status-badge ${su.status === 'resolved' ? 'success' : su.status === 'in-progress' ? 'info' : 'warning'}`}>
                                {su.status}
                              </span>
                            </td>
                            <td>{new Date(su.created_at).toLocaleDateString()}</td>
                            <td>
                              <select
                                className="role-select"
                                value={su.status}
                                onChange={(e) => handleUpdateSecurityStatus(su.id, e.target.value)}
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Activity */}
            {activeTab === 'activity' && (
              <div>
                {activityLog.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-clock-history"></i>
                    <p>No activity recorded yet</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
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
                            <td><span className="status-badge secondary">{log.action}</span></td>
                            <td>{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-input" value={profile?.username || ''} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={profile?.email || ''} disabled />
                </div>
                <Row>
                  <Col md={6}>
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input type="text" className="form-input" value={profileEdit.firstname || ''} onChange={(e) => setProfileEdit({...profileEdit, firstname: e.target.value})} />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input type="text" className="form-input" value={profileEdit.lastname || ''} onChange={(e) => setProfileEdit({...profileEdit, lastname: e.target.value})} />
                    </div>
                  </Col>
                </Row>
                <div className="form-group">
                  <label className="form-label">Display Name</label>
                  <input type="text" className="form-input" value={profileEdit.display_name || ''} onChange={(e) => setProfileEdit({...profileEdit, display_name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-input" value={profileEdit.phone || ''} onChange={(e) => setProfileEdit({...profileEdit, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-input form-textarea" value={profileEdit.bio || ''} onChange={(e) => setProfileEdit({...profileEdit, bio: e.target.value})} />
                </div>
                <button className="btn-action primary" onClick={handleUpdateProfile} disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Create Admin Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-person-plus me-2"></i>Create New Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input type="text" className="form-input" value={newAdmin.username} onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})} />
              </div>
            </Col>
            <Col md={6}>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" value={newAdmin.email} onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})} />
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" className="form-input" value={newAdmin.firstname} onChange={(e) => setNewAdmin({...newAdmin, firstname: e.target.value})} />
              </div>
            </Col>
            <Col md={6}>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-input" value={newAdmin.lastname} onChange={(e) => setNewAdmin({...newAdmin, lastname: e.target.value})} />
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className="form-input" value={newAdmin.password} onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})} />
              </div>
            </Col>
            <Col md={6}>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-input form-select" value={newAdmin.role} onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}>
                  <option value="Admin">Admin</option>
                  <option value="SuperAdmin">SuperAdmin</option>
                </select>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-action outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
          <button className="btn-action primary" onClick={handleCreateAdmin} disabled={actionLoading}>
            {actionLoading ? 'Creating...' : 'Create Admin'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Security Modal */}
      <Modal show={showSecurityModal} onHide={() => setShowSecurityModal(false)} className="custom-modal warning">
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-shield-exclamation me-2"></i>Add Security Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input type="text" className="form-input" value={newSecurity.title} onChange={(e) => setNewSecurity({...newSecurity, title: e.target.value})} placeholder="e.g., SQL Injection Found" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" value={newSecurity.description} onChange={(e) => setNewSecurity({...newSecurity, description: e.target.value})} placeholder="Describe the issue..." />
          </div>
          <div className="form-group">
            <label className="form-label">Severity</label>
            <select className="form-input form-select" value={newSecurity.severity} onChange={(e) => setNewSecurity({...newSecurity, severity: e.target.value})}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-action outline" onClick={() => setShowSecurityModal(false)}>Cancel</button>
          <button className="btn-action primary" onClick={handleCreateSecurityUpdate} disabled={actionLoading}>
            {actionLoading ? 'Creating...' : 'Add Update'}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default SuperAdminDashboard;
