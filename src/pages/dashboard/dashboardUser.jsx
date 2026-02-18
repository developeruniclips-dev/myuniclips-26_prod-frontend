import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Tabs,
  Tab,
  Badge,
  ProgressBar
} from "react-bootstrap";
import axios from "axios";
import { UPLOADS_BASE_URL } from "../../api/axios";
import { useAuth } from "../../context/temp";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [library, setLibrary] = useState([]);
  const [filteredLibrary, setFilteredLibrary] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("purchased");
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
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

  // Fetch purchases on load
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/purchases/my-purchases`,
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );

        const purchases = res.data.purchases || [];
        setPurchasedCourses(purchases);
        setFilteredCourses(purchases);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching purchases:", err);
        setLoading(false);
      }
    };

    if (user) fetchPurchases();
  }, [user]);

  // Fetch library (saved courses)
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/my-library`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setLibrary(res.data.library || []);
        setFilteredLibrary(res.data.library || []);
      } catch (err) {
        console.error('Error fetching library:', err);
      } finally {
        setLibraryLoading(false);
      }
    };

    if (user) fetchLibrary();
  }, [user]);

  // Handle remove from library
  const handleRemoveFromLibrary = async (course) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/remove`,
        { subjectId: course.subject_id, scholarId: course.scholar_id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setLibrary(prev => prev.filter(c => 
        !(c.subject_id === course.subject_id && c.scholar_id === course.scholar_id)
      ));
      setFilteredLibrary(prev => prev.filter(c => 
        !(c.subject_id === course.subject_id && c.scholar_id === course.scholar_id)
      ));
    } catch (err) {
      console.error('Error removing from library:', err);
    }
  };

  // Search handler
  useEffect(() => {
    const query = search.toLowerCase();

    const filtered = purchasedCourses.filter((course) =>
      course.title.toLowerCase().includes(query)
    );
    setFilteredCourses(filtered);

    // Also filter library
    const filteredLib = library.filter((course) =>
      course.subject_name?.toLowerCase().includes(query) ||
      course.degree_programmes?.toLowerCase().includes(query)
    );
    setFilteredLibrary(filteredLib);
  }, [search, purchasedCourses, library]);

  return (
    <div className="bg-light min-vh-100">
      <Container className="py-5">
        {/* Welcome Header */}
        <div className="row mb-4">
          <div className="col-lg-8">
            <h2 className="fw-bold mb-1">Welcome back, {user?.fname || user?.firstname}! 👋</h2>
            <p className="text-muted">Continue learning and growing your skills</p>
          </div>
          
          {/* Profile Card */}
          <div className="col-lg-4">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-4">
                {userProfile?.profile_image_url ? (
                  <img 
                    src={`${UPLOADS_BASE_URL}/${userProfile.profile_image_url}`}
                    alt="Profile"
                    className="rounded-circle mb-3"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', border: '3px solid #6366f1' }}
                  />
                ) : (
                  <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-person-circle fs-1 text-primary"></i>
                  </div>
                )}
                <h6 className="fw-bold mb-1">{user?.fname || user?.firstname} {user?.lname || user?.lastname}</h6>
                <p className="text-muted small mb-3">Email: {user?.email}</p>
                
                {/* Bio */}
                {userProfile?.bio && (
                  <div className="text-start mb-3 p-2 bg-light rounded">
                    <small className="text-muted fw-semibold">Bio</small>
                    <p className="small mb-0">{userProfile.bio}</p>
                  </div>
                )}
                
                {/* Profile Details */}
                {(userProfile?.favorite_subject || userProfile?.favorite_food || userProfile?.hobbies) && (
                  <div className="text-start mb-3">
                    {userProfile?.favorite_subject && (
                      <div className="mb-2">
                        <i className="bi bi-book text-primary me-2"></i>
                        <small><strong>Favorite Subject:</strong> {userProfile.favorite_subject}</small>
                      </div>
                    )}
                    {userProfile?.favorite_food && (
                      <div className="mb-2">
                        <i className="bi bi-emoji-smile text-warning me-2"></i>
                        <small><strong>Favorite Food:</strong> {userProfile.favorite_food}</small>
                      </div>
                    )}
                    {userProfile?.hobbies && (
                      <div className="mb-2">
                        <i className="bi bi-heart text-danger me-2"></i>
                        <small><strong>Hobbies:</strong> {userProfile.hobbies}</small>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="d-flex flex-column gap-2">
                  {/* Scholar Dashboard Button - only show if user is a scholar */}
                  {user?.roles?.includes('Scholar') && (
                    <Button 
                      variant="success" 
                      size="sm" 
                      className="w-100"
                      onClick={() => navigate('/scholar-dashboard')}
                    >
                      <i className="bi bi-mortarboard me-2"></i>
                      Go to Scholar Dashboard
                    </Button>
                  )}
                  
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="px-3 flex-grow-1"
                      onClick={() => window.location.href = '/edit-profile'}
                    >
                      Edit Profile
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="px-3 flex-grow-1"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to logout?')) {
                          logout();
                          navigate('/');
                        }
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                </div>
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
                    <i className="bi bi-book fs-3 text-primary"></i>
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">Courses Purchased</p>
                    <h4 className="mb-0 fw-bold">{purchasedCourses.length}</h4>
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
                    <i className="bi bi-bookmark fs-3 text-info"></i>
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">Saved Courses</p>
                    <h4 className="mb-0 fw-bold">{library.length}</h4>
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
                    <i className="bi bi-check-circle fs-3 text-success"></i>
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">Completed</p>
                    <h4 className="mb-0 fw-bold">0</h4>
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
                    <i className="bi bi-clock-history fs-3 text-warning"></i>
                  </div>
                  <div>
                    <p className="text-muted mb-0 small">In Progress</p>
                    <h4 className="mb-0 fw-bold">{purchasedCourses.length}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* My Courses Section with Tabs */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-3">
                <h5 className="fw-bold mb-0">My Courses</h5>
                {/* Search Icon/Input */}
                <div className="d-flex align-items-center">
                  {searchExpanded ? (
                    <div className="d-flex align-items-center" style={{ animation: 'slideIn 0.3s ease' }}>
                      <Form.Control
                        type="text"
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '200px', borderRadius: '20px', fontSize: '0.9rem' }}
                        autoFocus
                      />
                      <Button
                        variant="link"
                        className="p-1 ms-1"
                        onClick={() => {
                          setSearchExpanded(false);
                          setSearch("");
                        }}
                      >
                        <i className="bi bi-x-lg text-muted"></i>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="link"
                      className="p-1 text-muted"
                      onClick={() => setSearchExpanded(true)}
                      title="Search courses"
                    >
                      <i className="bi bi-search" style={{ fontSize: '1.1rem' }}></i>
                    </Button>
                  )}
                </div>
              </div>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate('/all-videos')}
              >
                <i className="bi bi-plus-circle me-2"></i>Browse More Courses
              </Button>
            </div>

            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4"
            >
              {/* Purchased Courses Tab */}
              <Tab 
                eventKey="purchased" 
                title={
                  <span>
                    <i className="bi bi-bag-check me-2"></i>
                    Purchased
                    {purchasedCourses.length > 0 && (
                      <Badge bg="primary" className="ms-2">{purchasedCourses.length}</Badge>
                    )}
                  </span>
                }
              >
                <div className="pt-3">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 text-muted">Loading your courses...</p>
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <i className="bi bi-collection-play" style={{ fontSize: '4rem', color: '#6366f1' }}></i>
                      </div>
                      <h5 className="fw-bold mb-2">No Courses Yet</h5>
                      <p className="text-muted mb-4">
                        {search ? "No courses match your search." : "Start your learning journey by browsing our course library!"}
                      </p>
                      <Button 
                        variant="primary" 
                        size="lg"
                        onClick={() => navigate('/all-videos')}
                      >
                        Explore Courses
                      </Button>
                    </div>
                  ) : (
                    <Row>
                      {filteredCourses.map((course, idx) => (
                        <Col md={6} lg={4} className="mb-4" key={idx}>
                          <Card 
                            className="h-100 border-0 shadow-sm" 
                            style={{ 
                              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-5px)';
                              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                            }}
                          >
                            {/* Video Preview */}
                            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                              <video
                                src={course.video_url}
                                className="w-100"
                                style={{ height: "200px", objectFit: "cover" }}
                              />
                              <div 
                                style={{ 
                                  position: 'absolute', 
                                  top: '50%', 
                                  left: '50%', 
                                  transform: 'translate(-50%, -50%)',
                                  background: 'rgba(99, 102, 241, 0.9)',
                                  borderRadius: '50%',
                                  width: '60px',
                                  height: '60px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                <i className="bi bi-play-fill text-white" style={{ fontSize: '2rem' }}></i>
                              </div>
                            </div>

                            <Card.Body>
                              <Card.Title className="fw-bold mb-2" style={{ fontSize: '1.1rem' }}>
                                {course.title}
                              </Card.Title>

                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="badge bg-primary bg-opacity-10 text-primary">
                                  €{course.amount} {course.currency}
                                </span>
                                <small className="text-muted">
                                  <i className="bi bi-calendar3 me-1"></i>
                                  {new Date(course.created_at).toLocaleDateString()}
                                </small>
                              </div>

                              <Button 
                                variant="primary" 
                                className="w-100"
                                onClick={() => navigate(`/watch/${course.video_id}`)}
                              >
                                <i className="bi bi-play-circle me-2"></i>Continue Learning
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              </Tab>

              {/* Saved Courses (Library) Tab */}
              <Tab 
                eventKey="saved" 
                title={
                  <span>
                    <i className="bi bi-bookmark me-2"></i>
                    Saved
                    {library.length > 0 && (
                      <Badge bg="secondary" className="ms-2">{library.length}</Badge>
                    )}
                  </span>
                }
              >
                <div className="pt-3">
                  {libraryLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 text-muted">Loading your saved courses...</p>
                    </div>
                  ) : filteredLibrary.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <i className="bi bi-bookmark" style={{ fontSize: '4rem', color: '#6366f1' }}></i>
                      </div>
                      <h5 className="fw-bold mb-2">No Saved Courses</h5>
                      <p className="text-muted mb-4">
                        {search ? "No saved courses match your search." : "Save courses to watch later by clicking the bookmark icon on any course."}
                      </p>
                      <Button 
                        variant="primary" 
                        size="lg"
                        onClick={() => navigate('/all-videos')}
                      >
                        Browse Courses
                      </Button>
                    </div>
                  ) : (
                    <Row>
                      {filteredLibrary.map((course) => (
                        <Col lg={4} md={6} className="mb-4" key={`${course.subject_id}-${course.scholar_id}`}>
                          <Card className="h-100 shadow-sm" style={{ overflow: 'hidden' }}>
                            {/* Thumbnail */}
                            <div 
                              style={{ position: 'relative', cursor: 'pointer' }}
                              onClick={() => navigate(`/course/${course.subject_id}/${course.scholar_id}`)}
                            >
                              <Card.Img
                                variant="top"
                                src={course.thumbnailUrl}
                                alt={course.subject_name}
                                style={{ 
                                  aspectRatio: '16/9', 
                                  objectFit: 'cover',
                                  backgroundColor: '#e9ecef'
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/640x360?text=Course';
                                }}
                              />
                              {/* Progress overlay */}
                              {course.progressPercent > 0 && (
                                <div 
                                  className="position-absolute bottom-0 start-0 end-0"
                                  style={{ background: 'rgba(0,0,0,0.7)', padding: '8px 12px' }}
                                >
                                  <div className="d-flex justify-content-between align-items-center text-white mb-1">
                                    <small>{course.progressPercent}% Complete</small>
                                    <small>{course.watchedVideos}/{course.totalVideos} videos</small>
                                  </div>
                                  <ProgressBar 
                                    now={course.progressPercent} 
                                    variant="success" 
                                    style={{ height: '4px' }}
                                  />
                                </div>
                              )}
                              {/* Play button overlay */}
                              <div 
                                className="position-absolute top-50 start-50 translate-middle"
                                style={{
                                  background: 'rgba(255,255,255,0.9)',
                                  borderRadius: '50%',
                                  width: '50px',
                                  height: '50px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: 0.9
                                }}
                              >
                                <i className="bi bi-play-fill text-primary" style={{ fontSize: '1.5rem' }}></i>
                              </div>
                            </div>

                            <Card.Body className="d-flex flex-column">
                              {/* Subject Name */}
                              <Card.Title 
                                className="fw-bold mb-2" 
                                style={{ fontSize: '1rem', cursor: 'pointer' }}
                                onClick={() => navigate(`/course/${course.subject_id}/${course.scholar_id}`)}
                              >
                                {course.subject_name}
                              </Card.Title>

                              {/* Degree Programme */}
                              <div className="mb-2">
                                <small className="text-muted">
                                  <i className="bi bi-mortarboard me-1"></i>
                                  {course.degree_programmes || 'General Studies'}
                                </small>
                              </div>

                              {/* Scholar Info */}
                              <div className="mb-3">
                                <small className="text-muted">
                                  <i className="bi bi-person me-1"></i>
                                  {course.scholar_fname} {course.scholar_lname}
                                </small>
                              </div>

                              {/* Stats */}
                              <div className="d-flex gap-2 mb-3 flex-wrap">
                                <Badge bg="light" text="dark">
                                  <i className="bi bi-collection-play me-1"></i>
                                  {course.totalVideos} videos
                                </Badge>
                                {course.progressPercent === 100 ? (
                                  <Badge bg="success">
                                    <i className="bi bi-check-circle me-1"></i>
                                    Completed
                                  </Badge>
                                ) : course.progressPercent > 0 ? (
                                  <Badge bg="info">
                                    <i className="bi bi-play-circle me-1"></i>
                                    In Progress
                                  </Badge>
                                ) : (
                                  <Badge bg="secondary">
                                    <i className="bi bi-clock me-1"></i>
                                    Not Started
                                  </Badge>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="mt-auto d-flex gap-2">
                                <Button 
                                  variant="primary" 
                                  className="flex-grow-1"
                                  onClick={() => navigate(`/course/${course.subject_id}/${course.scholar_id}`)}
                                >
                                  {course.progressPercent > 0 ? 'Continue' : 'Start Learning'}
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  onClick={() => handleRemoveFromLibrary(course)}
                                  title="Remove from saved"
                                >
                                  <i className="bi bi-bookmark-x"></i>
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Dashboard;
