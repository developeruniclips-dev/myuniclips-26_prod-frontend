// src/pages/dashboard/ScholarTabs.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { UPLOADS_BASE_URL } from "../../../api/axios";
import { useAuth } from "../../../context/temp";
import { Button, Card, Tabs, Tab, Table, Badge, Alert, Collapse, Modal } from "react-bootstrap";

function ScholarTabs() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [statusSubjects, setStatusSubjects] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [scholarProfile, setScholarProfile] = useState(null);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [verificationEmailSending, setVerificationEmailSending] = useState(false);
  const [earningsData, setEarningsData] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null); // Video being played in modal

  // Reset all state when user changes
  useEffect(() => {
    if (!user) {
      setSubjects([]);
      setStatusSubjects([]);
      setVideos([]);
      setUserProfile(null);
      setScholarProfile(null);
      setStripeStatus(null);
      setEarningsData(null);
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.token) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/users/profile`,
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );
        setUserProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  // Fetch scholar profile approval status
  useEffect(() => {
    const fetchScholarProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-profile/status`,
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );
        setScholarProfile(res.data);
      } catch (err) {
        console.error("Error fetching scholar profile:", err);
      }
    };

    if (user) fetchScholarProfile();
  }, [user]);

  // Fetch earnings data from Stripe
  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user?.token || !scholarProfile?.approved) return;
      setEarningsLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/earnings`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setEarningsData(res.data);
      } catch (err) {
        console.error("Error fetching earnings:", err);
      } finally {
        setEarningsLoading(false);
      }
    };

    if (user && scholarProfile?.approved) fetchEarnings();
  }, [user, scholarProfile]);

  // Fetch course applications (subjects scholar applied to teach)
  useEffect(() => {
    const fetchApprovedSubjects = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects/status`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setStatusSubjects(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching scholar status:", err);
      }
    };

    if (user) fetchApprovedSubjects();
  }, [user]);

  // Fetch course data (subjects)
  useEffect(() => {
    const fetchUserSubjects = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects/by-user`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setSubjects(res.data.subjects || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setLoading(false);
      }
    };

    if (user) fetchUserSubjects();
  }, [user]);

  // Fetch videos (courses) for earnings
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/all-videos`
        );
        // Filter only this scholar's videos
        const scholarVideos = res.data.videos?.filter(v => v.scholar_user_id === user.id) || [];
        setVideos(scholarVideos);
      } catch (err) {
        console.error(err);
      }
    };

    if (user) fetchVideos();
  }, [user]);

  // Fetch Stripe Connect status
  useEffect(() => {
    const fetchStripeStatus = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/account-status`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setStripeStatus(res.data);
      } catch (err) {
        console.error("Error fetching Stripe status:", err);
        setStripeStatus({ connected: false });
      }
    };

    if (user && scholarProfile?.approved) {
      fetchStripeStatus();
    }
  }, [user, scholarProfile]);

  // Check for Stripe return/refresh URLs and auto-send verification email if needed
  useEffect(() => {
    const stripeParam = searchParams.get('stripe');
    
    const checkAndSendVerificationEmail = async () => {
      if (stripeParam === 'success' && user?.token) {
        try {
          // Check if there are pending requirements
          const statusRes = await axios.get(
            `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/account-status`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          
          // If connected but onboarding not complete, send verification email automatically
          if (statusRes.data.connected && !statusRes.data.onboardingComplete) {
            console.log('Stripe onboarding incomplete, sending verification email...');
            
            await axios.post(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/send-verification-email`,
              {},
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            
            alert('Almost done! We\'ve sent you an email with a link to complete your Stripe verification. Please check your inbox.');
          } else if (statusRes.data.onboardingComplete) {
            alert('Stripe setup complete! You can now receive payouts.');
          }
        } catch (err) {
          console.error('Error checking/sending verification:', err);
        }
        
        // Clean up URL and refresh
        setTimeout(() => {
          window.location.href = '/scholar-dashboard';
        }, 1000);
      } else if (stripeParam === 'refresh') {
        // User needs to continue onboarding
        alert('Please complete your Stripe onboarding to receive payouts');
      }
    };
    
    if (stripeParam) {
      checkAndSendVerificationEmail();
    }
  }, [searchParams, user]);

  // Handle Stripe Connect onboarding
  const handleStripeConnect = async () => {
    setStripeLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/create-account`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // Redirect to Stripe onboarding
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Error creating Stripe account:", err);
      const errorMessage = err.response?.data?.message || "Failed to connect with Stripe. Please try again.";
      alert(errorMessage);
      setStripeLoading(false);
    }
  };

  // Send verification email with Stripe link
  const handleSendVerificationEmail = async () => {
    setVerificationEmailSending(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/stripe-connect/send-verification-email`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (res.data.fullyVerified) {
        alert('Your Stripe account is fully verified! No additional action needed.');
      } else {
        alert(`Verification email sent to ${user.email}. Please check your inbox.`);
      }
    } catch (err) {
      console.error("Error sending verification email:", err);
      const errorMessage = err.response?.data?.message || "Failed to send verification email. Please try again.";
      alert(errorMessage);
    } finally {
      setVerificationEmailSending(false);
    }
  };

  // Check if scholar profile is approved
  const isApproved = scholarProfile?.approved === true;

  // Handle delete course (delete all videos for a subject)
  const handleDeleteCourse = async (subjectId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This will delete all videos in this course. This action cannot be undone.`)) {
      return;
    }

    try {
      // Find all videos for this subject belonging to this scholar
      const subjectVideos = videos.filter(v => v.subject_id === subjectId);
      
      if (subjectVideos.length === 0) {
        // If no videos, try to delete from scholar_subjects
        const subject = statusSubjects.find(s => s.subject_id === subjectId);
        if (subject) {
          await axios.delete(
            `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/scholar-subjects/my/${subject.id}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
        } else {
          alert("Course not found");
          return;
        }
      } else {
        // Delete all videos for this subject
        for (const video of subjectVideos) {
          await axios.delete(
            `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/my/${video.id}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
        }
      }
      
      alert("Course deleted successfully");
      window.location.reload();
    } catch (err) {
      console.error("Error deleting course:", err);
      alert(err.response?.data?.message || "Failed to delete course");
    }
  };

  // Handle delete video
  const handleDeleteVideo = async (videoId, videoTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${videoTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/my/${videoId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      alert("Video deleted successfully");
      window.location.reload();
    } catch (err) {
      console.error("Error deleting video:", err);
      alert(err.response?.data?.message || "Failed to delete video");
    }
  };

  // Calculate earnings with 70% for first 100 sales, 50% thereafter
  const calculateEarnings = (sales, pricePerSale) => {
    const salesBelow100 = Math.min(sales, 100);
    const salesAbove100 = Math.max(0, sales - 100);
    
    const earningsBelow = salesBelow100 * pricePerSale * 0.7; // 70%
    const earningsAbove = salesAbove100 * pricePerSale * 0.5; // 50%
    
    return {
      below100Sales: salesBelow100,
      above100Sales: salesAbove100,
      below100: earningsBelow.toFixed(2),
      above100: earningsAbove.toFixed(2),
      total: (earningsBelow + earningsAbove).toFixed(2)
    };
  };

  // Use real earnings data from API or fallback to calculated values
  const totalEarnings = earningsData?.summary?.scholarEarnings 
    ? parseFloat(earningsData.summary.scholarEarnings) 
    : videos.reduce((sum, video) => {
        const earnings = calculateEarnings(video.sales || 0, video.price || 0);
        return sum + parseFloat(earnings.total);
      }, 0);

  const totalSales = earningsData?.summary?.totalSales 
    ? parseInt(earningsData.summary.totalSales) 
    : videos.reduce((sum, video) => sum + (video.sales || 0), 0);

  const pendingBalance = earningsData?.summary?.pendingBalance 
    ? parseFloat(earningsData.summary.pendingBalance) 
    : 0;

  const totalPaid = earningsData?.summary?.totalPaid 
    ? parseFloat(earningsData.summary.totalPaid) 
    : 0;
  
  // Get current month sales from API (real data)
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentMonthSales = earningsData?.summary?.monthlySales 
    ? parseInt(earningsData.summary.monthlySales) 
    : 0;
  const currentMonthEarnings = earningsData?.summary?.monthlyEarnings 
    ? parseFloat(earningsData.summary.monthlyEarnings) 
    : 0;

  // Build combined courses list for display (grouped by subject)
  const getCoursesList = () => {
    const coursesMap = new Map();
    
    // Group videos by subject_id
    videos.forEach(video => {
      const subjectId = video.subject_id;
      const subjectName = video.subject_name || video.title;
      
      if (!coursesMap.has(subjectId)) {
        coursesMap.set(subjectId, {
          id: `subject-${subjectId}`,
          title: subjectName,
          subject_id: subjectId,
          status: video.approved === 1 ? 'published' : 'review',
          sales: 0,
          price: video.price || 0,
          videoCount: 0,
          allApproved: true,
          videos: []
        });
      }
      
      const course = coursesMap.get(subjectId);
      course.sales += (video.sales || 0);
      course.videoCount += 1;
      course.videos.push(video);
      
      // If any video is pending review, mark course as review
      if (video.approved === 0) {
        course.status = 'review';
        course.allApproved = false;
      }
    });
    
    // Add pending subject applications (that don't have videos yet) AND update sales from statusSubjects
    statusSubjects.forEach(subject => {
      const hasVideos = videos.some(v => v.subject_id === subject.subject_id);
      if (!hasVideos) {
        coursesMap.set(subject.subject_id, {
          id: `subject-${subject.id}`,
          title: subject.subject_name || subject.degree || 'Course Application',
          subject_id: subject.subject_id,
          status: subject.approved === 1 ? 'approved' : 'pending',
          sales: parseInt(subject.sales_count) || 0,
          price: parseFloat(subject.bundle_price) || 0,
          videoCount: 0,
          allApproved: true,
          videos: []
        });
      } else {
        // Update existing course with sales data from statusSubjects
        const existingCourse = coursesMap.get(subject.subject_id);
        if (existingCourse) {
          existingCourse.sales = parseInt(subject.sales_count) || 0;
          existingCourse.price = parseFloat(subject.bundle_price) || existingCourse.price || 0;
        }
      }
    });
    
    return Array.from(coursesMap.values());
  };

  const renderStatusBadge = (status) => {
    switch(status) {
      case 'published':
        return <Badge bg="success">Published ✓</Badge>;
      case 'review':
        return <Badge bg="warning" text="dark">Videos uploaded for review</Badge>;
      case 'approved':
        return <Badge bg="info">Ready to upload videos</Badge>;
      case 'pending':
        return <Badge bg="secondary">Application in progress</Badge>;
      default:
        return <Badge bg="dark">Unknown</Badge>;
    }
  };

  const getActionButton = (course) => {
    switch(course.status) {
      case 'published':
        return (
          <div className="d-flex gap-2 align-items-center">
            <span className="text-success fw-semibold">Live</span>
            <Link 
              to={`/upload-video?subject_id=${course.subject_id}`} 
              className="btn btn-sm btn-outline-primary"
            >
              + Add Video
            </Link>
          </div>
        );
      case 'review':
        return (
          <div className="d-flex gap-2 align-items-center">
            <Link to={`/course/${course.subject_id}/${user?.id || ''}`} className="text-primary text-decoration-none fw-semibold">
              View Videos ({course.videoCount})
            </Link>
            <Link 
              to={`/upload-video?subject_id=${course.subject_id}`} 
              className="btn btn-sm btn-outline-primary"
            >
              + Add
            </Link>
          </div>
        );
      case 'approved':
        return (
          <Link to={`/upload-video?subject_id=${course.subject_id}`} className="btn btn-sm btn-primary">
            Upload Videos
          </Link>
        );
      case 'pending':
        return <span className="text-muted">Waiting approval</span>;
      default:
        return null;
    }
  };

  const coursesList = getCoursesList();
  
  // Calculate total courses based on grouped subjects
  const totalCourses = coursesList.length;

  // Get next payout date (1st of next month)
  const getNextPayoutDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        {/* Header Section */}
        <div className="text-center mb-4">
          <h4 className="text-muted mb-1">UNICLIPS OY</h4>
          <h2 className="fw-bold text-primary mb-3">SCHOLAR WORLD</h2>
        </div>

        {/* Welcome and Profile Row */}
        <div className="row mb-4">
          <div className="col-lg-8">
            <h3 className="fw-bold mb-1">Welcome back scholar {user?.fname}! 👋</h3>
            <p className="text-muted">Manage your courses and track your earnings</p>
          </div>
          
          {/* Profile Card */}
          <div className="col-lg-4">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-3">
                {userProfile?.profile_image_url ? (
                  <img 
                    src={`${UPLOADS_BASE_URL}/${userProfile.profile_image_url}`}
                    alt="Profile"
                    className="rounded-circle mb-2"
                    style={{ width: '60px', height: '60px', objectFit: 'cover', border: '3px solid #6366f1' }}
                  />
                ) : (
                  <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-person-circle fs-2 text-primary"></i>
                  </div>
                )}
                <h6 className="fw-bold mb-1">{user?.fname} {user?.lname}</h6>
                <p className="text-muted small mb-2">{user?.email}</p>
                
                {/* Stripe Connect Status */}
                {scholarProfile?.approved && (
                  <div className="mb-2">
                    {stripeStatus?.connected && stripeStatus?.onboardingComplete ? (
                      <Badge bg="success" className="mb-2">
                        <i className="bi bi-check-circle me-1"></i>
                        Stripe Linked
                      </Badge>
                    ) : (
                      <Badge bg="warning" text="dark" className="mb-2">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Action Required
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    <i className="bi bi-book me-1"></i>Learner
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to logout?')) {
                        logout();
                        navigate('/login');
                      }
                    }}
                  >
                    Logout
                  </Button>
                </div>
                
                {/* Stripe Connect Button */}
                {scholarProfile?.approved && !stripeStatus?.onboardingComplete && (
                  <>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="w-100 mt-2"
                      onClick={handleStripeConnect}
                      disabled={stripeLoading}
                    >
                      {stripeLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-stripe me-2"></i>
                          {stripeStatus?.connected ? 'Complete Stripe Setup' : 'Connect with Stripe'}
                        </>
                      )}
                    </Button>
                    
                    {/* Send verification email button - show when connected but needs verification */}
                    {stripeStatus?.connected && (
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="w-100 mt-2"
                        onClick={handleSendVerificationEmail}
                        disabled={verificationEmailSending}
                      >
                        {verificationEmailSending ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-envelope me-2"></i>
                            Email Me Verification Link
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultActiveKey="dashboard" className="mb-4 nav-pills-custom" fill>

          {/* ========== DASHBOARD & COURSES TAB ========== */}
          <Tab eventKey="dashboard" title="Dashboard & Courses">
            
            {/* Stats Cards Row */}
            <div className="row g-3 mb-4">
              {/* Total Earning for the year */}
              <div className="col-md-6 col-lg-3">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-currency-euro fs-4 text-primary"></i>
                    </div>
                    <p className="text-muted small mb-1">Total Earning for the year</p>
                    <h3 className="fw-bold text-primary mb-0">€{totalEarnings.toFixed(2)}</h3>
                  </Card.Body>
                </Card>
              </div>
              
              {/* Total Courses */}
              <div className="col-md-6 col-lg-3">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-journal-code fs-4 text-success"></i>
                    </div>
                    <p className="text-muted small mb-1">Total Courses</p>
                    <h3 className="fw-bold text-success mb-0">{totalCourses}</h3>
                  </Card.Body>
                </Card>
              </div>
              
              {/* Total Sales */}
              <div className="col-md-6 col-lg-3">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="rounded-circle bg-info bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-bar-chart-fill fs-4 text-info"></i>
                    </div>
                    <p className="text-muted small mb-1">Total Sales</p>
                    <h3 className="fw-bold text-info mb-0">{totalSales}</h3>
                  </Card.Body>
                </Card>
              </div>
              
              {/* This Month's Sales */}
              <div className="col-md-6 col-lg-3">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="rounded-circle bg-warning bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-calendar-check fs-4 text-warning"></i>
                    </div>
                    <p className="text-muted small mb-1">This Month's Sales</p>
                    <h3 className="fw-bold text-warning mb-0">{currentMonthSales}</h3>
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* My UniClips Courses Section */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-collection-play me-2"></i>
                    My UniClips Courses ({coursesList.length})
                  </h5>
                </div>
                
                <Table responsive hover className="mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th style={{width: '30%'}}>Subject Name</th>
                      <th style={{width: '25%'}}>STATUS</th>
                      <th style={{width: '10%'}} className="text-center">SALES</th>
                      <th style={{width: '20%'}}>ACTION</th>
                      <th style={{width: '15%'}} className="text-center">DELETE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="spinner-border text-primary" role="status"></div>
                        </td>
                      </tr>
                    ) : coursesList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                          No courses yet. Apply to teach a subject to get started!
                        </td>
                      </tr>
                    ) : (
                      coursesList.map((course) => (
                        <>
                          <tr key={course.id}>
                            <td>
                              <div 
                                className="fw-semibold d-flex align-items-center"
                                style={{ cursor: course.videoCount > 0 ? 'pointer' : 'default' }}
                                onClick={() => {
                                  if (course.videoCount > 0) {
                                    setExpandedCourse(expandedCourse === course.subject_id ? null : course.subject_id);
                                  }
                                }}
                              >
                                {course.videoCount > 0 && (
                                  <i className={`bi bi-chevron-${expandedCourse === course.subject_id ? 'down' : 'right'} me-2 text-primary`}></i>
                                )}
                                {course.title}
                              </div>
                              {course.videoCount > 0 && (
                                <small 
                                  className="text-primary" 
                                  style={{ cursor: 'pointer', marginLeft: course.videoCount > 0 ? '1.25rem' : 0 }}
                                  onClick={() => setExpandedCourse(expandedCourse === course.subject_id ? null : course.subject_id)}
                                >
                                  <i className="bi bi-play-circle me-1"></i>
                                  {course.videoCount} video{course.videoCount > 1 ? 's' : ''} - Click to view
                                </small>
                              )}
                            </td>
                            <td>{renderStatusBadge(course.status)}</td>
                            <td className="text-center">
                              <span className="badge bg-light text-dark fs-6">{course.sales}</span>
                            </td>
                            <td>{getActionButton(course)}</td>
                            <td className="text-center">
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDeleteCourse(course.subject_id, course.title)}
                              >
                                <i className="bi bi-trash me-1"></i>
                                Delete
                              </Button>
                            </td>
                          </tr>
                          {/* Expanded Video List Row */}
                          {expandedCourse === course.subject_id && course.videos && course.videos.length > 0 && (
                            <tr key={`${course.id}-videos`}>
                              <td colSpan="5" className="bg-light p-0">
                                <div className="p-3">
                                  <h6 className="fw-bold mb-3">
                                    <i className="bi bi-collection-play me-2"></i>
                                    Videos in {course.title}
                                  </h6>
                                  
                                  {/* In-page Video Player */}
                                  {playingVideo && playingVideo.subject_id === course.subject_id && (
                                    <div className="mb-4">
                                      <Card className="border-0 shadow">
                                        <div className="d-flex justify-content-between align-items-center bg-dark text-white px-3 py-2">
                                          <span className="fw-semibold">
                                            <i className="bi bi-play-circle me-2"></i>
                                            Now Playing: {playingVideo.title}
                                          </span>
                                          <Button 
                                            variant="link" 
                                            className="text-white p-0"
                                            onClick={() => setPlayingVideo(null)}
                                          >
                                            <i className="bi bi-x-lg"></i>
                                          </Button>
                                        </div>
                                        {playingVideo.video_url && playingVideo.video_url.includes('vimeo.com') && (
                                          <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                                            <iframe
                                              src={`https://player.vimeo.com/video/${playingVideo.video_url.split('/').pop()}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1`}
                                              frameBorder="0"
                                              allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                                              style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%'
                                              }}
                                              title={playingVideo.title}
                                            ></iframe>
                                          </div>
                                        )}
                                        <Card.Body>
                                          <h5 className="fw-bold mb-2">{playingVideo.title}</h5>
                                          <p className="text-muted mb-0">{playingVideo.description}</p>
                                        </Card.Body>
                                      </Card>
                                    </div>
                                  )}
                                  
                                  <div className="row">
                                    {course.videos
                                      .sort((a, b) => (a.sequence_index || 0) - (b.sequence_index || 0))
                                      .map((video, idx) => (
                                        <div key={video.id} className="col-md-6 col-lg-4 mb-3">
                                          <Card 
                                            className={`h-100 shadow-sm ${playingVideo?.id === video.id ? 'border-primary border-2' : ''}`} 
                                            style={{ cursor: 'pointer' }}
                                          >
                                            {/* Video Thumbnail */}
                                            <div 
                                              className="position-relative"
                                              onClick={() => setPlayingVideo({...video, subject_id: course.subject_id})}
                                            >
                                              {video.video_url && video.video_url.includes('vimeo.com') ? (
                                                <img 
                                                  src={`https://vumbnail.com/${video.video_url.split('/').pop()}.jpg`}
                                                  alt={video.title}
                                                  className="card-img-top"
                                                  style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                                                  onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/320x180?text=Video';
                                                  }}
                                                />
                                              ) : (
                                                <div 
                                                  className="bg-secondary d-flex align-items-center justify-content-center"
                                                  style={{ aspectRatio: '16/9' }}
                                                >
                                                  <i className="bi bi-play-circle text-white" style={{ fontSize: '2rem' }}></i>
                                                </div>
                                              )}
                                              {/* Play overlay */}
                                              <div 
                                                className="position-absolute top-50 start-50 translate-middle"
                                                style={{
                                                  background: 'rgba(99, 102, 241, 0.9)',
                                                  borderRadius: '50%',
                                                  width: '40px',
                                                  height: '40px',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center'
                                                }}
                                              >
                                                <i className="bi bi-play-fill text-white"></i>
                                              </div>
                                              {/* Video number badge */}
                                              <Badge 
                                                bg="dark" 
                                                className="position-absolute top-0 start-0 m-2"
                                              >
                                                #{idx + 1}
                                              </Badge>
                                              {/* Approval status badge */}
                                              <Badge 
                                                bg={video.approved === 1 ? 'success' : 'warning'} 
                                                className="position-absolute top-0 end-0 m-2"
                                              >
                                                {video.approved === 1 ? 'Live' : 'Pending'}
                                              </Badge>
                                              {/* Now playing indicator */}
                                              {playingVideo?.id === video.id && (
                                                <div 
                                                  className="position-absolute bottom-0 start-0 end-0 bg-primary text-white text-center py-1"
                                                  style={{ fontSize: '0.75rem' }}
                                                >
                                                  <i className="bi bi-soundwave me-1"></i>
                                                  Now Playing
                                                </div>
                                              )}
                                            </div>
                                            <Card.Body className="p-2" onClick={() => setPlayingVideo({...video, subject_id: course.subject_id})}>
                                              <Card.Title className="fs-6 mb-1" style={{ lineHeight: '1.2' }}>
                                                {video.title}
                                              </Card.Title>
                                              {video.description && (
                                                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                                                  {video.description.substring(0, 50)}{video.description.length > 50 ? '...' : ''}
                                                </small>
                                              )}
                                            </Card.Body>
                                          </Card>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            {/* Teach a New Course Button */}
            <div className="text-center mb-4">
              {isApproved ? (
                <Link to="/create-course">
                  <Button variant="primary" size="lg" className="px-5 py-3 rounded-pill shadow">
                    <i className="bi bi-plus-circle me-2"></i>
                    Teach a New Course
                  </Button>
                </Link>
              ) : (
                <Alert variant="warning" className="d-inline-block">
                  <i className="bi bi-clock-history me-2"></i>
                  Your scholar application is pending approval. You can teach courses once approved!
                </Alert>
              )}
            </div>

            {/* Footer */}
            <Card className="border-0 bg-light">
              <Card.Body className="text-center py-3">
                <p className="text-muted mb-2">© Uniclips Oy 2026</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <a href="#" className="text-decoration-none text-muted small">Terms & Privacy</a>
                  <span className="text-muted">|</span>
                  <a href="#" className="text-decoration-none text-muted small">Contact Us</a>
                </div>
              </Card.Body>
            </Card>
          </Tab>

          {/* ========== EARNINGS & PAYOUTS TAB ========== */}
          <Tab eventKey="earnings" title="Earnings & Payouts">
            
            {/* Earnings Header */}
            <div className="text-center mb-4">
              <h3 className="fw-bold">Hey scholar {user?.fname}. It's money time. 💰</h3>
            </div>

            {/* Detailed Earnings Report Header */}
            <Card className="border-0 shadow-sm mb-4 bg-primary text-white">
              <Card.Body className="py-3">
                <h5 className="fw-bold mb-2">
                  <i className="bi bi-graph-up-arrow me-2"></i>
                  DETAILED EARNINGS REPORT
                </h5>
                <p className="mb-0 opacity-75">
                  Track your revenue share: <strong>70%</strong> for the first 100 sales, <strong>50%</strong> thereafter
                </p>
              </Card.Body>
            </Card>

            {earningsLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Loading earnings data...</p>
              </div>
            ) : (
              <>
                {/* Summary Cards - Year and Month */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <Card className="border-0 shadow-sm h-100" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                      <Card.Body className="text-white text-center py-4">
                        <div className="rounded-circle bg-white bg-opacity-25 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                          <i className="bi bi-calendar-check fs-4"></i>
                        </div>
                        <p className="mb-1 opacity-75">Total Year Earning (€)</p>
                        <h2 className="mb-0 fw-bold">≈ €{totalEarnings.toFixed(2)}</h2>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-6">
                    <Card className="border-0 shadow-sm h-100" style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
                      <Card.Body className="text-white text-center py-4">
                        <div className="rounded-circle bg-white bg-opacity-25 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                          <i className="bi bi-calendar-month fs-4"></i>
                        </div>
                        <p className="mb-1 opacity-75">Total {currentMonth} Earning (€)</p>
                        <h2 className="mb-0 fw-bold">≈ €{currentMonthEarnings.toFixed(2)}</h2>
                      </Card.Body>
                    </Card>
                  </div>
                </div>

                {/* Per-Course Breakdown */}
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-collection-play me-2 text-primary"></i>
                  Breakdown by Course
                </h5>

                {getCoursesList().filter(c => c.videoCount > 0).length > 0 ? (
                  getCoursesList().filter(c => c.videoCount > 0).map((course, idx) => {
                    const earnings = calculateEarnings(course.sales || 0, course.price || 0);
                    const totalAmount = (course.sales || 0) * (course.price || 0);
                    
                    // Get monthly data from earningsData API if available
                    const courseEarningsData = earningsData?.salesByCourse?.find(
                      c => c.id === course.subject_id
                    );
                    const monthlySales = courseEarningsData?.monthlySales || 0;
                    const monthlyEarningsTotal = parseFloat(courseEarningsData?.monthlyEarnings || 0);
                    const monthlyEarnings = {
                      total: monthlyEarningsTotal.toFixed(2),
                      below100: (monthlySales * (course.price || 0) * 0.7).toFixed(2),
                      above100: "0.00"
                    };
                    
                    return (
                      <Card key={idx} className="border-0 shadow-sm mb-4">
                        {/* Course Header */}
                        <Card.Header className="bg-light border-0 py-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold text-dark mb-0">
                              <i className="bi bi-book me-2 text-primary"></i>
                              Course: {course.title}
                              <span className="text-muted fw-normal ms-2">
                                (€{course.price || 0}/sale)
                              </span>
                            </h6>
                            <Badge bg={course.status === 'published' ? 'success' : 'warning'}>
                              {course.videoCount} video{course.videoCount > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </Card.Header>
                        
                        <Card.Body>
                          {/* Total Sales & Amount */}
                          <div className="row g-3 mb-4">
                            <div className="col-md-6">
                              <Card className="bg-light border-0">
                                <Card.Body className="py-3 text-center">
                                  <small className="text-muted d-block">Total Sales</small>
                                  <h4 className="fw-bold mb-0 text-primary">{course.sales || 0}</h4>
                                </Card.Body>
                              </Card>
                            </div>
                            <div className="col-md-6">
                              <Card className="bg-light border-0">
                                <Card.Body className="py-3 text-center">
                                  <small className="text-muted d-block">Total Amount</small>
                                  <h4 className="fw-bold mb-0 text-dark">
                                    €{course.price}/sale × {course.sales || 0} = €{totalAmount.toFixed(2)}
                                  </h4>
                                </Card.Body>
                              </Card>
                            </div>
                          </div>
                          
                          {/* My Revenue Section */}
                          <h6 className="fw-bold mb-3 text-secondary">
                            <i className="bi bi-cash-coin me-2"></i>
                            My Revenue
                          </h6>
                          
                          <div className="row g-3 mb-4">
                            {/* Below 100 Sales */}
                            <div className="col-md-4">
                              <Card className="border-2 border-success h-100">
                                <Card.Body className="py-3">
                                  <small className="text-muted d-block mb-2">Below 100 sales (70%)</small>
                                  <div className="small text-muted mb-1">
                                    {earnings.below100Sales} sales × €{course.price} × 70%
                                  </div>
                                  <h5 className="fw-bold text-success mb-0">= €{earnings.below100}</h5>
                                </Card.Body>
                              </Card>
                            </div>
                            
                            {/* Above 100 Sales */}
                            <div className="col-md-4">
                              <Card className="border-2 border-info h-100">
                                <Card.Body className="py-3">
                                  <small className="text-muted d-block mb-2">Above 100 sales (50%)</small>
                                  <div className="small text-muted mb-1">
                                    {earnings.above100Sales} sales × €{course.price} × 50%
                                  </div>
                                  <h5 className="fw-bold text-info mb-0">= €{earnings.above100}</h5>
                                </Card.Body>
                              </Card>
                            </div>
                            
                            {/* Monthly Sales */}
                            <div className="col-md-4">
                              <Card className="border-2 border-warning h-100">
                                <Card.Body className="py-3">
                                  <small className="text-muted d-block mb-2">{currentMonth} Sales</small>
                                  <h5 className="fw-bold text-warning mb-0">{monthlySales} sales</h5>
                                </Card.Body>
                              </Card>
                            </div>
                          </div>
                          
                          {/* Monthly Revenue */}
                          <Card className="bg-primary bg-opacity-10 border-0">
                            <Card.Body className="py-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <small className="text-muted d-block">{currentMonth} Revenue</small>
                                  <span className="small text-muted">
                                    €{course.price}/sale × {monthlySales} sales × 70%
                                  </span>
                                </div>
                                <h4 className="fw-bold text-primary mb-0">= €{monthlyEarnings.total}</h4>
                              </div>
                            </Card.Body>
                          </Card>
                        </Card.Body>
                      </Card>
                    );
                  })
                ) : (
                  <Card className="border-0 shadow-sm mb-4">
                    <Card.Body className="text-center py-5">
                      <i className="bi bi-collection-play fs-1 text-muted d-block mb-3"></i>
                      <h5 className="text-muted">No courses with videos yet</h5>
                      <p className="text-muted">Start uploading courses to see your earnings breakdown!</p>
                    </Card.Body>
                  </Card>
                )}

                {/* Payout History */}
                <h5 className="fw-bold mb-3 mt-4">
                  <i className="bi bi-clock-history me-2 text-primary"></i>
                  Payout History
                </h5>
                
                {earningsData?.payoutHistory && earningsData.payoutHistory.length > 0 ? (
                  <Card className="border-0 shadow-sm mb-4">
                    <Card.Body className="p-0">
                      <Table responsive className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Transfer ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {earningsData.payoutHistory.map((payout, idx) => (
                            <tr key={idx}>
                              <td>{new Date(payout.date).toLocaleDateString()}</td>
                              <td className="fw-bold text-success">€{payout.amount}</td>
                              <td>
                                <Badge bg={payout.status === 'completed' ? 'success' : payout.status === 'pending' ? 'warning' : 'secondary'}>
                                  {payout.status}
                                </Badge>
                              </td>
                              <td><small className="text-muted">{payout.stripeTransferId || '-'}</small></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-sm mb-4">
                    <Card.Body className="text-center py-4">
                      <i className="bi bi-clock-history fs-1 text-muted d-block mb-3"></i>
                      <h6 className="text-muted">No payouts yet</h6>
                      <p className="text-muted small mb-0">Your payout history will appear here once you receive payments</p>
                    </Card.Body>
                  </Card>
                )}

                {/* Next Payout Date */}
                <Card className="border-0 shadow-sm" style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
                  <Card.Body className="text-center py-4">
                    <i className="bi bi-calendar-event fs-1 mb-3 d-block text-white"></i>
                    <h5 className="fw-bold mb-2 text-white">Next Payout Date</h5>
                    <h3 className="mb-2 text-white">{getNextPayoutDate()}</h3>
                    <p className="mb-0 text-white">Payouts are processed on the 1st of every month via Stripe</p>
                    {stripeStatus?.connected && stripeStatus?.onboardingComplete && (
                      <Badge bg="light" text="dark" className="mt-3">
                        <i className="bi bi-check-circle text-success me-1"></i>
                        Stripe Connected - Ready for payouts
                      </Badge>
                    )}
                  </Card.Body>
                </Card>
              </>
            )}

          </Tab>

        </Tabs>
      </div>
    </div>
  );
}

export default ScholarTabs;
