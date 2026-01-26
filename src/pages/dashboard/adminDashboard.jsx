import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Badge, Tabs, Tab, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UPLOADS_BASE_URL } from "../../api/axios";
import { useAuth } from "../../context/temp";
import "./dashboard.css";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [scholarApplications, setScholarApplications] = useState([]);
  const [courseApplications, setCourseApplications] = useState([]);
  const [videos, setVideos] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [scholarsPayouts, setScholarsPayouts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoPrices, setVideoPrices] = useState({}); // Track prices for each video
  const [bundlePrices, setBundlePrices] = useState({}); // Track bundle prices for each subject
  const [pricingSearch, setPricingSearch] = useState(""); // Search filter for course pricing
  const [expandedBundles, setExpandedBundles] = useState({}); // Track expanded bundles in video management
  const [platformBalance, setPlatformBalance] = useState({ available: 0, pending: 0 }); // Platform Stripe balance
  
  // Profile state for admin profile editing
  const [adminProfile, setAdminProfile] = useState(null);
  const [profileEdit, setProfileEdit] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  // Check if user is SuperAdmin (has SuperAdmin role)
  const isSuperAdmin = user?.roles?.includes('SuperAdmin');
  const isAdmin = user?.roles?.includes('Admin') || isSuperAdmin;

  // Fetch admin profile
  const fetchAdminProfile = async () => {
    if (!user?.token) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/profile`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setAdminProfile(res.data);
      setProfileEdit(res.data);
    } catch (err) {
      console.error("Error fetching admin profile:", err);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    setProfileLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/admin/profile`,
        profileEdit,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Profile updated successfully!");
      fetchAdminProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Reset all state when user changes to prevent stale data
    setUsers([]);
    setScholarApplications([]);
    setCourseApplications([]);
    setVideos([]);
    setTransactions([]);
    setScholarsPayouts([]);
    setSubjects([]);
    setVideoPrices({});
    setBundlePrices({});
    setLoading(true);

    const fetchData = async () => {
      // Wait for user to be available
      if (!user) {
        console.log("No user yet, waiting...");
        setLoading(false);
        return;
      }

      console.log("Admin Dashboard - User:", user);
      console.log("User has token:", !!user?.token);
      
      try {
        // Fetch all users (no auth required)
        console.log("Fetching users...");
        try {
          const usersRes = await axios.get(
            `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/users`
          );
          console.log("Users fetched:", usersRes.data);
          setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        } catch (err) {
          console.error("Error fetching users:", err);
        }

        // Only fetch protected endpoints if we have a token
        if (user?.token) {
          console.log("Fetching scholar applications with token...");
          // Fetch scholar profile applications (not course applications)
          try {
            const scholarsRes = await axios.get(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-profile/applications`,
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            console.log("Scholar applications fetched:", scholarsRes.data);
            setScholarApplications(scholarsRes.data.applications || []);
          } catch (err) {
            console.error("Error fetching scholar applications:", err);
            console.error("Error response:", err.response);
            setScholarApplications([]);
          }

          // Fetch course/subject applications (scholars applying to teach subjects)
          console.log("Fetching course applications...");
          try {
            const courseAppsRes = await axios.get(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects/all`,
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            console.log("Course applications fetched:", courseAppsRes.data);
            setCourseApplications(courseAppsRes.data.subjects || []);
          } catch (err) {
            console.error("Error fetching course applications:", err);
            setCourseApplications([]);
          }
        }

        console.log("Fetching videos...");
        // Fetch all videos (admin gets unapproved ones too)
        try {
          const videosRes = await axios.get(
            `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/admin/all`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          console.log("Videos fetched:", videosRes.data);
          setVideos(videosRes.data.videos || []);
        } catch (err) {
          console.error("Error fetching videos:", err);
        }

        // Fetch all transactions (admin only)
        if (user?.token) {
          console.log("Fetching transactions...");
          try {
            const transactionsRes = await axios.get(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/purchases/transactions/all`,
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            console.log("Transactions fetched:", transactionsRes.data);
            setTransactions(transactionsRes.data.transactions || []);
          } catch (err) {
            console.error("Error fetching transactions:", err);
          }

          // Fetch scholars Stripe status for payouts
          console.log("Fetching scholars payouts status...");
          try {
            const scholarsPayoutsRes = await axios.get(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/scholars-status`,
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            console.log("Scholars payouts fetched:", scholarsPayoutsRes.data);
            setScholarsPayouts(scholarsPayoutsRes.data.scholars || []);
          } catch (err) {
            console.error("Error fetching scholars payouts:", err);
          }

          // Fetch platform Stripe balance
          console.log("Fetching platform balance...");
          try {
            const balanceRes = await axios.get(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/platform-balance`,
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            console.log("Platform balance fetched:", balanceRes.data);
            setPlatformBalance({
              available: balanceRes.data.available?.eur || 0,
              pending: balanceRes.data.pending?.eur || 0
            });
          } catch (err) {
            console.error("Error fetching platform balance:", err);
          }

          // Fetch all subjects for pricing management
          console.log("Fetching subjects...");
          try {
            const subjectsRes = await axios.get(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/subjects`
            );
            console.log("Subjects fetched:", subjectsRes.data);
            const subjectsList = Array.isArray(subjectsRes.data) ? subjectsRes.data : [];
            setSubjects(subjectsList);
            // Initialize bundle prices from fetched data
            const initialPrices = {};
            subjectsList.forEach(s => {
              initialPrices[s.id] = s.bundle_price || 6.00;
            });
            setBundlePrices(initialPrices);
          } catch (err) {
            console.error("Error fetching subjects:", err);
          }
        }

        console.log("All data fetched, stopping loading");
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setLoading(false);
      }
    };

    fetchData();
    fetchAdminProfile();
  }, [user?.id, user?.token]); // More specific dependencies

  const handleApproveScholar = async (userId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-profile/approve`,
        { user_id: userId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      alert("Scholar application approved successfully!");
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error("Error approving scholar:", err);
      alert("Failed to approve scholar application");
    }
  };

  const handleRejectScholar = async (userId) => {
    if (!window.confirm("Are you sure you want to reject this scholar application? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-profile/reject`,
        { user_id: userId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      alert("Scholar application rejected");
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error("Error rejecting scholar:", err);
      alert("Failed to reject scholar application");
    }
  };

  const handleApproveVideo = async (videoId) => {
    try {
      const price = videoPrices[videoId] || 0;
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/${videoId}/approve`,
        { price: Number(price) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error("Error approving video:", err);
      alert("Failed to approve video");
    }
  };

  const handleVideoPriceChange = (videoId, price) => {
    setVideoPrices(prev => ({ ...prev, [videoId]: price }));
  };

  const handleRejectVideo = async (videoId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/${videoId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error("Error rejecting video:", err);
      alert("Failed to reject video");
    }
  };

  const handleApproveCourse = async (courseId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects/approve/${courseId}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      alert("Course application approved!");
      window.location.reload();
    } catch (err) {
      console.error("Error approving course:", err);
      alert("Failed to approve course application");
    }
  };

  const handleRejectCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to reject this course application?")) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects/${courseId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      alert("Course application rejected");
      window.location.reload();
    } catch (err) {
      console.error("Error rejecting course:", err);
      alert("Failed to reject course application");
    }
  };

  // Update bundle price for a subject
  const handleUpdateBundlePrice = async (subjectId) => {
    const newPrice = bundlePrices[subjectId];
    if (newPrice === undefined || newPrice < 0) {
      alert("Please enter a valid price (must be 0 or greater)");
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/subjects/${subjectId}/bundle-price`,
        { bundlePrice: parseFloat(newPrice) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      alert("Bundle price updated successfully!");
      // Update local state
      setSubjects(prev => prev.map(s => 
        s.id === subjectId ? { ...s, bundle_price: parseFloat(newPrice) } : s
      ));
    } catch (err) {
      console.error("Error updating bundle price:", err);
      alert("Failed to update bundle price");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This will delete all their data including courses, videos, and purchases. This action cannot be undone.`)) {
      return;
    }

    try {
      // Use SuperAdmin-only endpoint for user deletion
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/users/super-admin/${userId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      alert("User deleted successfully");
      window.location.reload();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleReleaseFunds = async (scholarUserId, amount) => {
    try {
      const confirmed = window.confirm(
        `Are you sure you want to release €${amount.toFixed(2)} to this scholar?`
      );
      
      if (!confirmed) return;

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
      window.location.reload();
    } catch (err) {
      console.error("Error releasing funds:", err);
      alert(err.response?.data?.message || "Failed to release funds. Please ensure the scholar has completed Stripe onboarding.");
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Container className="py-5">
        {/* Admin Header */}
        <div className="row mb-4">
          <div className="col-lg-8">
            <h2 className="fw-bold mb-1">{isSuperAdmin ? 'Super Admin Dashboard 🛡️' : 'Admin Dashboard 👨‍💼'}</h2>
            <p className="text-muted">{isSuperAdmin ? 'Full system control and management' : 'Manage users, scholars, and content'}</p>
          </div>
          
          {/* Admin Profile Card */}
          <div className="col-lg-4">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-4">
                <div className={`rounded-circle ${isSuperAdmin ? 'bg-danger' : 'bg-primary'} bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3`} style={{ width: '80px', height: '80px' }}>
                  <i className={`bi ${isSuperAdmin ? 'bi-shield-fill-check' : 'bi-shield-check'} fs-1 ${isSuperAdmin ? 'text-danger' : 'text-primary'}`}></i>
                </div>
                <h6 className="fw-bold mb-1">{isSuperAdmin ? 'Super Administrator' : 'Administrator'}</h6>
                <p className="text-muted small mb-3">{isSuperAdmin ? 'Full System Control' : 'Operations Management'}</p>
                {isSuperAdmin && (
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="px-3 me-2 mb-2"
                    onClick={() => navigate('/superadmin-dashboard')}
                  >
                    <i className="bi bi-shield-lock me-1"></i>
                    Control Center
                  </Button>
                )}
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="px-3"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      logout();
                      navigate('/login');
                    }
                  }}
                >
                  Logout
                </Button>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="rounded-3 p-3 bg-primary bg-opacity-10 me-3">
                    <i className="bi bi-people fs-3 text-primary"></i>
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">Total Users</p>
                    <h4 className="mb-0 fw-bold">{users.length}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="rounded-3 p-3 bg-success bg-opacity-10 me-3">
                    <i className="bi bi-cash-stack fs-3 text-success"></i>
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">Total Revenue</p>
                    <h4 className="mb-0 fw-bold">
                      €{transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toFixed(2)}
                    </h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="rounded-3 p-3 bg-warning bg-opacity-10 me-3">
                    <i className="bi bi-play-circle fs-3 text-warning"></i>
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">Total Videos</p>
                    <h4 className="mb-0 fw-bold">{videos.length}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="rounded-3 p-3 bg-info bg-opacity-10 me-3">
                    <i className="bi bi-clock-history fs-3 text-info"></i>
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">Pending Approvals</p>
                    <h4 className="mb-0 fw-bold">
                      {scholarApplications.filter(s => s.approved === 0).length + 
                       courseApplications.filter(c => c.approved === 0).length +
                       videos.filter(v => v.approved === 0).length}
                    </h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Management Tabs */}
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <Tabs defaultActiveKey="scholars" className="mb-3">
              {/* Scholar Applications Tab */}
              <Tab eventKey="scholars" title="Scholar Applications">
                <div className="table-responsive">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                    </div>
                  ) : scholarApplications.length === 0 ? (
                    <p className="text-center text-muted py-5">No scholar applications</p>
                  ) : (
                    <Table hover>
                      <thead className="bg-light">
                        <tr>
                          <th>Applicant</th>
                          <th>Email</th>
                          <th>University</th>
                          <th>Degree</th>
                          <th>Year</th>
                          {/* TODO: Student ID verification - uncomment when ready
                          <th>Student ID</th>
                          */}
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
                            {/* TODO: Student ID verification - uncomment when ready
                            <td>
                              {app.task_card_url ? (
                                <a 
                                  href={`${UPLOADS_BASE_URL}/${app.task_card_url}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="bi bi-card-image me-1"></i>
                                  View ID
                                </a>
                              ) : (
                                <span className="text-muted">
                                  <i className="bi bi-x-circle me-1"></i>
                                  None
                                </span>
                              )}
                            </td>
                            */}
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
                                  <Button 
                                    size="sm" 
                                    variant="success"
                                    onClick={() => handleApproveScholar(app.user_id)}
                                  >
                                    <i className="bi bi-check-lg me-1"></i>
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="danger"
                                    onClick={() => handleRejectScholar(app.user_id)}
                                  >
                                    <i className="bi bi-x-lg me-1"></i>
                                    Reject
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
              <Tab eventKey="courses" title="Course Applications">
                <div className="table-responsive">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                    </div>
                  ) : courseApplications.length === 0 ? (
                    <p className="text-center text-muted py-5">No course applications</p>
                  ) : (
                    <Table hover>
                      <thead className="bg-light">
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
                                {app.profile_image_url ? (
                                  <img 
                                    src={`${UPLOADS_BASE_URL}/${app.profile_image_url}`} 
                                    alt={app.fname}
                                    className="rounded-circle me-2"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div className="rounded-circle bg-info bg-opacity-10 me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                    <i className="bi bi-book-fill text-info"></i>
                                  </div>
                                )}
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
                                  <Button 
                                    size="sm" 
                                    variant="success"
                                    onClick={() => handleApproveCourse(app.id)}
                                  >
                                    <i className="bi bi-check-lg me-1"></i>
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="danger"
                                    onClick={() => handleRejectCourse(app.id)}
                                  >
                                    <i className="bi bi-x-lg me-1"></i>
                                    Reject
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

              {/* Videos Tab */}
              <Tab eventKey="videos" title="Video Management">
                <div>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                    </div>
                  ) : videos.length === 0 ? (
                    <p className="text-center text-muted py-5">No videos uploaded</p>
                  ) : (() => {
                    // Group videos by subject + scholar (bundle)
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

                    // Sort videos within each bundle by sequence
                    Object.values(bundles).forEach(bundle => {
                      bundle.videos.sort((a, b) => a.sequence_index - b.sequence_index);
                      bundle.totalVideos = bundle.videos.length;
                      bundle.approvedCount = bundle.videos.filter(v => v.approved === 1).length;
                      bundle.pendingCount = bundle.totalVideos - bundle.approvedCount;
                    });

                    const bundleList = Object.values(bundles);

                    return (
                      <div>
                        {bundleList.map((bundle) => (
                          <Card key={bundle.key} className="mb-3 border">
                            {/* Bundle Header - Clickable to expand */}
                            <Card.Header 
                              className="d-flex justify-content-between align-items-center py-3"
                              style={{ cursor: 'pointer', background: expandedBundles[bundle.key] ? '#e8f4fd' : '#f8f9fa' }}
                              onClick={() => setExpandedBundles(prev => ({
                                ...prev,
                                [bundle.key]: !prev[bundle.key]
                              }))}
                            >
                              <div className="d-flex align-items-center gap-3">
                                <i className={`bi ${expandedBundles[bundle.key] ? 'bi-chevron-down' : 'bi-chevron-right'} fs-5`}></i>
                                <div>
                                  <h6 className="mb-0 fw-bold">
                                    <i className="bi bi-collection-play me-2 text-primary"></i>
                                    {bundle.subjectName}
                                  </h6>
                                  <small className="text-muted">
                                    by {bundle.scholarName} • €{bundle.bundlePrice}/bundle
                                  </small>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-3">
                                <Badge bg="secondary" className="px-3 py-2">
                                  {bundle.totalVideos} video{bundle.totalVideos !== 1 ? 's' : ''}
                                </Badge>
                                {bundle.pendingCount > 0 && (
                                  <Badge bg="warning" text="dark" className="px-3 py-2">
                                    {bundle.pendingCount} pending
                                  </Badge>
                                )}
                                {bundle.approvedCount === bundle.totalVideos && (
                                  <Badge bg="success" className="px-3 py-2">
                                    All Published
                                  </Badge>
                                )}
                              </div>
                            </Card.Header>

                            {/* Expanded Video List */}
                            {expandedBundles[bundle.key] && (
                              <Card.Body className="p-0">
                                <Table hover className="mb-0">
                                  <thead className="bg-light">
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
                                          {video.sequence_index === 1 && (
                                            <Badge bg="info" className="ms-2">Free Preview</Badge>
                                          )}
                                        </td>
                                        <td>
                                          <Badge bg="light" text="dark">{video.sequence_index}</Badge>
                                        </td>
                                        <td>
                                          {video.approved === 1 ? (
                                            <Badge bg="success">Published</Badge>
                                          ) : (
                                            <Badge bg="warning" text="dark">Pending</Badge>
                                          )}
                                        </td>
                                        <td>
                                          <div className="d-flex gap-2">
                                            {video.approved !== 1 && (
                                              <Button 
                                                size="sm" 
                                                variant="success"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleApproveVideo(video.id);
                                                }}
                                              >
                                                <i className="bi bi-check-lg me-1"></i>
                                                Approve
                                              </Button>
                                            )}
                                            <Button 
                                              size="sm" 
                                              variant="outline-danger"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(`Are you sure you want to delete "${video.title}"? This action cannot be undone.`)) {
                                                  handleRejectVideo(video.id);
                                                }
                                              }}
                                            >
                                              <i className="bi bi-trash"></i>
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                                {/* Approve All Button */}
                                {bundle.pendingCount > 0 && (
                                  <div className="p-3 bg-light border-top">
                                    <Button 
                                      variant="success"
                                      onClick={() => {
                                        if (window.confirm(`Approve all ${bundle.pendingCount} pending videos in "${bundle.subjectName}"?`)) {
                                          bundle.videos
                                            .filter(v => v.approved !== 1)
                                            .forEach(v => handleApproveVideo(v.id));
                                        }
                                      }}
                                    >
                                      <i className="bi bi-check-all me-2"></i>
                                      Approve All Pending ({bundle.pendingCount})
                                    </Button>
                                  </div>
                                )}
                              </Card.Body>
                            )}
                          </Card>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </Tab>

              {/* Users Tab */}
              <Tab eventKey="users" title="User Management">
                <div className="table-responsive">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                    </div>
                  ) : users.length === 0 ? (
                    <p className="text-center text-muted py-5">No users found</p>
                  ) : (
                    <>
                      {!isSuperAdmin && (
                        <Alert variant="info" className="mb-3">
                          <i className="bi bi-info-circle me-2"></i>
                          <strong>View Only:</strong> User deletion requires SuperAdmin privileges. Contact SuperAdmin for user management actions.
                        </Alert>
                      )}
                      <Table hover>
                        <thead className="bg-light">
                          <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Scholar</th>
                            <th>Joined</th>
                            {isSuperAdmin && <th>Action</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr key={u.id}>
                              <td>#{u.id}</td>
                              <td>{u.fname} {u.lname}</td>
                              <td>{u.email}</td>
                              <td>
                                {u.is_scholar === 1 || u.isScholar === 1 ? (
                                  <Badge bg="primary">Yes</Badge>
                                ) : (
                                  <Badge bg="secondary">No</Badge>
                                )}
                              </td>
                              <td>
                                {u.created_at 
                                  ? new Date(u.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : 'N/A'
                                }
                              </td>
                              {isSuperAdmin && (
                                <td>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleDeleteUser(u.id, `${u.fname} ${u.lname}`)}
                                    disabled={u.email === user?.email}
                                    title={u.email === user?.email ? "Cannot delete yourself" : "Delete user"}
                                  >
                                    <i className="bi bi-trash"></i> Delete
                                  </Button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </>
                  )}
                </div>
              </Tab>

              {/* Transactions Tab */}
              <Tab eventKey="transactions" title="Transactions">
                <div className="table-responsive">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                    </div>
                  ) : transactions.length === 0 ? (
                    <p className="text-center text-muted py-5">No transactions found</p>
                  ) : (
                    <Table hover>
                      <thead className="bg-light">
                        <tr>
                          <th>Transaction ID</th>
                          <th>Date</th>
                          <th>Buyer</th>
                          <th>Video</th>
                          <th>Scholar</th>
                          <th>Amount</th>
                          <th>Provider</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((t) => (
                          <tr key={t.transaction_id}>
                            <td>
                              <small className="text-muted">#{t.transaction_id}</small>
                            </td>
                            <td>
                              <small>{new Date(t.transaction_date).toLocaleDateString()}</small>
                              <br />
                              <small className="text-muted">{new Date(t.transaction_date).toLocaleTimeString()}</small>
                            </td>
                            <td>
                              <div>
                                <small className="fw-bold">{t.buyer_fname} {t.buyer_lname}</small>
                                <br />
                                <small className="text-muted">{t.buyer_email}</small>
                              </div>
                            </td>
                            <td>
                              <small>{t.video_title || `Video #${t.video_id}`}</small>
                            </td>
                            <td>
                              <small>{t.scholar_fname} {t.scholar_lname}</small>
                            </td>
                            <td>
                              <strong className="text-success">€{parseFloat(t.amount || 0).toFixed(2)}</strong>
                            </td>
                            <td>
                              <Badge bg="primary" className="text-uppercase">
                                {t.provider || 'N/A'}
                              </Badge>
                            </td>
                            <td>
                              {t.status === 'succeeded' || t.status === 'completed' ? (
                                <Badge bg="success">Success</Badge>
                              ) : t.status === 'pending' ? (
                                <Badge bg="warning" text="dark">Pending</Badge>
                              ) : t.status === 'failed' ? (
                                <Badge bg="danger">Failed</Badge>
                              ) : (
                                <Badge bg="secondary">{t.status}</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                  
                  {/* Transaction Summary */}
                  {!loading && transactions.length > 0 && (
                    <div className="mt-3 p-3 bg-light rounded">
                      <Row>
                        <Col md={4}>
                          <div className="text-center">
                            <p className="text-muted mb-1 small">Total Transactions</p>
                            <h5 className="mb-0 fw-bold">{transactions.length}</h5>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="text-center">
                            <p className="text-muted mb-1 small">Total Revenue</p>
                            <h5 className="mb-0 fw-bold text-success">
                              €{transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toFixed(2)}
                            </h5>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="text-center">
                            <p className="text-muted mb-1 small">Successful Transactions</p>
                            <h5 className="mb-0 fw-bold">
                              {transactions.filter(t => t.status === 'succeeded' || t.status === 'completed').length}
                            </h5>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              </Tab>

              {/* Payouts Tab - SuperAdmin Only */}
              {isSuperAdmin && (
              <Tab eventKey="payouts" title="Payouts Management">
                {/* Platform Balance Info */}
                <Alert variant="info" className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Platform Balance:</strong>{' '}
                      <span className="text-success">€{platformBalance.available.toFixed(2)} available</span>
                      {platformBalance.pending > 0 && (
                        <span className="text-muted ms-2">
                          (€{platformBalance.pending.toFixed(2)} pending - available in 2-7 days)
                        </span>
                      )}
                    </div>
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      You can only release funds that are available in your Stripe account
                    </small>
                  </div>
                </Alert>
                
                <div className="table-responsive">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                    </div>
                  ) : scholarsPayouts.length === 0 ? (
                    <p className="text-center text-muted py-5">No scholars found</p>
                  ) : (
                    <Table hover>
                      <thead className="bg-light">
                        <tr>
                          <th>SCHOLAR</th>
                          <th>COUNTRY</th>
                          <th>STRIPE STATUS</th>
                          <th>PENDING (EUR)</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scholarsPayouts.map((scholar) => {
                          const pendingAmount = parseFloat(scholar.pendingBalance) || 0;
                          const canPayout = pendingAmount > 0 && platformBalance.available >= pendingAmount;
                          
                          return (
                          <tr key={scholar.id}>
                            <td>
                              <div>
                                <strong>{scholar.fname} {scholar.lname}</strong>
                                <br />
                                <small className="text-muted">{scholar.email}</small>
                              </div>
                            </td>
                            <td>{scholar.country || 'Finland'}</td>
                            <td>
                              {scholar.stripeStatus === 'Linked' ? (
                                <Badge bg="success">Linked</Badge>
                              ) : scholar.stripeStatus === 'Action Required' ? (
                                <Badge bg="warning" text="dark">Action Required</Badge>
                              ) : scholar.stripeStatus === 'Incomplete' ? (
                                <Badge bg="info">Incomplete</Badge>
                              ) : (
                                <Badge bg="secondary">{scholar.stripeStatus}</Badge>
                              )}
                            </td>
                            <td>
                              <strong className="text-primary">€{scholar.pendingBalance || '0.00'}</strong>
                            </td>
                            <td>
                              {scholar.payoutsEnabled ? (
                                canPayout ? (
                                  <Button 
                                    size="sm" 
                                    variant="success"
                                    onClick={() => handleReleaseFunds(scholar.id, pendingAmount)}
                                  >
                                    Release €{pendingAmount.toFixed(2)}
                                  </Button>
                                ) : pendingAmount > 0 ? (
                                  <Button 
                                    size="sm" 
                                    variant="outline-warning"
                                    disabled
                                    title="Funds not yet available in platform account"
                                  >
                                    Funds Pending
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="outline-secondary"
                                    disabled
                                  >
                                    No Balance
                                  </Button>
                                )
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline-secondary"
                                  disabled
                                >
                                  Pending
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                        })}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Tab>
              )}

              {/* Course Pricing Management Tab - SuperAdmin Only */}
              {isSuperAdmin && (
              <Tab eventKey="pricing" title="Course Pricing">
                <div className="p-3">
                  <h5 className="mb-3">
                    <i className="bi bi-currency-euro me-2 text-success"></i>
                    Course Bundle Pricing
                  </h5>
                  <p className="text-muted mb-4">
                    Set the bundle price for each subject. Users pay this price to unlock all videos in a course.
                  </p>
                  
                  {/* Search Bar */}
                  <Form.Group className="mb-4">
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        placeholder="Search by subject name or degree programme..."
                        value={pricingSearch}
                        onChange={(e) => setPricingSearch(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                      />
                      <i 
                        className="bi bi-search position-absolute" 
                        style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }}
                      ></i>
                      {pricingSearch && (
                        <Button
                          variant="link"
                          size="sm"
                          className="position-absolute p-0"
                          style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                          onClick={() => setPricingSearch("")}
                        >
                          <i className="bi bi-x-lg text-muted"></i>
                        </Button>
                      )}
                    </div>
                  </Form.Group>
                  
                  {subjects.filter(s => 
                    s.name.toLowerCase().includes(pricingSearch.toLowerCase()) ||
                    (s.degree_programmes && s.degree_programmes.toLowerCase().includes(pricingSearch.toLowerCase()))
                  ).length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-book" style={{ fontSize: '2rem' }}></i>
                      <p className="mt-2">No subjects found</p>
                    </div>
                  ) : (
                    <Table responsive hover>
                      <thead className="table-light">
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
                            <td>
                              <strong>{subject.name}</strong>
                              {subject.description && (
                                <small className="d-block text-muted">{subject.description}</small>
                              )}
                            </td>
                            <td>
                              <Badge bg="secondary">
                                {subject.degree_programmes || 'Not specified'}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg="success" className="fs-6">
                                €{parseFloat(subject.bundle_price || 6.00).toFixed(2)}
                              </Badge>
                            </td>
                            <td style={{ width: '150px' }}>
                              <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                value={bundlePrices[subject.id] || ''}
                                onChange={(e) => setBundlePrices(prev => ({
                                  ...prev,
                                  [subject.id]: e.target.value
                                }))}
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
                                <i className="bi bi-check-lg me-1"></i>
                                Update
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Tab>
              )}

              {/* My Profile Tab */}
              <Tab eventKey="profile" title={<><i className="bi bi-person-gear me-1"></i>My Profile</>}>
                <Row>
                  <Col md={8}>
                    <h5 className="mb-4">Edit Your Profile</h5>
                    <Form>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" value={adminProfile?.username || ''} disabled />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" value={adminProfile?.email || ''} disabled />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={profileEdit.firstname || ''}
                              onChange={(e) => setProfileEdit({...profileEdit, firstname: e.target.value})}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={profileEdit.lastname || ''}
                              onChange={(e) => setProfileEdit({...profileEdit, lastname: e.target.value})}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Display Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={profileEdit.display_name || ''}
                              onChange={(e) => setProfileEdit({...profileEdit, display_name: e.target.value})}
                              placeholder="How you want to be shown"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                              type="text"
                              value={profileEdit.phone || ''}
                              onChange={(e) => setProfileEdit({...profileEdit, phone: e.target.value})}
                              placeholder="+358 12 345 6789"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>Department</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileEdit.department || ''}
                          onChange={(e) => setProfileEdit({...profileEdit, department: e.target.value})}
                          placeholder="e.g., Engineering, Marketing"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Bio</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={profileEdit.bio || ''}
                          onChange={(e) => setProfileEdit({...profileEdit, bio: e.target.value})}
                          placeholder="Tell us about yourself..."
                        />
                      </Form.Group>
                      <Button variant="primary" onClick={handleUpdateProfile} disabled={profileLoading}>
                        {profileLoading ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </Form>
                  </Col>
                  <Col md={4}>
                    <Card className="bg-light border-0">
                      <Card.Body className="text-center">
                        <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                          <i className="bi bi-person-fill fs-1 text-primary"></i>
                        </div>
                        <h5 className="mb-1">{adminProfile?.display_name || adminProfile?.firstname || adminProfile?.username}</h5>
                        <p className="text-muted mb-2">{adminProfile?.email}</p>
                        <Badge bg={isSuperAdmin ? 'danger' : 'primary'}>
                          {isSuperAdmin ? '🛡️ SuperAdmin' : '👤 Admin'}
                        </Badge>
                        {adminProfile?.department && (
                          <p className="text-muted mt-2 mb-0 small">
                            <i className="bi bi-building me-1"></i>{adminProfile.department}
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default AdminDashboard;
