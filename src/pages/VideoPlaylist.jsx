import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Modal, Badge, Form, InputGroup } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/temp";
import axios from "axios";

// Helper function to extract Vimeo video ID from URL
const getVimeoId = (url) => {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
};

// Helper function to get Vimeo thumbnail URL
const getVimeoThumbnail = (videoId) => {
  return `https://vumbnail.com/${videoId}.jpg`;
};

function VideoPlaylist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      course.subjectName?.toLowerCase().includes(query) ||
      course.scholarName?.toLowerCase().includes(query) ||
      course.degreeProgramme?.toLowerCase().includes(query) ||
      course.university?.toLowerCase().includes(query)
    );
  });

  // Update URL when search changes
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/all-videos`);
        const videos = res.data.videos || [];
        
        // Group videos by subject + scholar to create courses
        const courseMap = {};
        videos.forEach(v => {
          const key = `${v.subject_id}-${v.scholar_user_id}`;
          if (!courseMap[key]) {
            courseMap[key] = {
              id: key,
              subjectId: v.subject_id,
              subjectName: v.subject_name,
              degreeProgramme: v.degree_programme,
              scholarId: v.scholar_user_id,
              scholarName: `${v.scholar_fname} ${v.scholar_lname}`,
              scholarInitials: `${v.scholar_fname?.[0] || ''}${v.scholar_lname?.[0] || ''}`,
              university: v.scholar_university || 'University not specified',
              videos: []
            };
          }
          courseMap[key].videos.push(v);
        });

        // Sort videos within each course by sequence_index
        Object.values(courseMap).forEach(course => {
          course.videos.sort((a, b) => a.sequence_index - b.sequence_index);
          // Get thumbnail from first video
          const firstVideo = course.videos[0];
          course.thumbnailUrl = getVimeoThumbnail(getVimeoId(firstVideo?.video_url));
          course.totalVideos = course.videos.length;
          course.firstVideoFree = course.videos.some(v => v.is_free);
        });

        setCourses(Object.values(courseMap));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleCourseClick = (course) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    // Navigate to course detail page
    navigate(`/course/${course.subjectId}/${course.scholarId}`);
  };

  return (
    <Container className="my-5" style={{ minHeight: '70vh' }}>
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Courses</h2>
        <p className="text-muted">Explore courses from our expert scholars</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <InputGroup style={{ maxWidth: '500px' }}>
          <Form.Control
            type="text"
            placeholder="Search by subject, scholar, degree, or university..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ padding: '0.75rem 1rem' }}
          />
          {searchQuery && (
            <Button 
              variant="outline-secondary" 
              onClick={() => handleSearchChange('')}
            >
              <i className="bi bi-x-lg"></i>
            </Button>
          )}
          <Button variant="primary">
            <i className="bi bi-search"></i>
          </Button>
        </InputGroup>
        {searchQuery && (
          <small className="text-muted mt-2 d-block">
            Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </small>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading courses...</p>
        </div>
      )}

      {/* Empty State - No courses at all */}
      {!loading && courses.length === 0 && (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <div className="mb-4">
              <i className="bi bi-book" style={{ fontSize: '5rem', color: '#6366f1' }}></i>
            </div>
            <h3 className="fw-bold mb-3">No Courses Available Yet</h3>
            <p className="text-muted mb-4">
              We're currently building our course library. Check back soon for exciting content from our scholars!
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/become-scholar')}
              >
                Become a Scholar
              </Button>
              <Button 
                variant="outline-primary" 
                size="lg"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* No Search Results */}
      {!loading && courses.length > 0 && filteredCourses.length === 0 && (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <div className="mb-4">
              <i className="bi bi-search" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
            </div>
            <h4 className="fw-bold mb-3">No courses found</h4>
            <p className="text-muted mb-4">
              No courses match "{searchQuery}". Try a different search term.
            </p>
            <Button 
              variant="outline-primary"
              onClick={() => handleSearchChange('')}
            >
              Clear Search
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Course Grid */}
      <Row>
        {filteredCourses.map((course) => (
          <Col lg={4} md={6} className="mb-4" key={course.id}>
            <Card 
              className="h-100 shadow-sm course-card" 
              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => handleCourseClick(course)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
              }}
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative' }}>
                <Card.Img
                  variant="top"
                  src={course.thumbnailUrl}
                  alt={course.subjectName}
                  style={{ 
                    aspectRatio: '16/9', 
                    objectFit: 'cover',
                    backgroundColor: '#e9ecef'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/640x360?text=Course+Thumbnail';
                  }}
                />
                {/* Play overlay */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s'
                  }}
                  className="play-overlay"
                >
                  <div 
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: '50%',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className="bi bi-play-fill text-primary" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
                {/* Video count badge */}
                <Badge 
                  bg="dark" 
                  className="position-absolute"
                  style={{ bottom: '10px', right: '10px' }}
                >
                  <i className="bi bi-collection-play me-1"></i>
                  {course.totalVideos} video{course.totalVideos !== 1 ? 's' : ''}
                </Badge>
                {/* First video free badge */}
                {course.firstVideoFree && (
                  <Badge 
                    bg="success" 
                    className="position-absolute"
                    style={{ top: '10px', left: '10px' }}
                  >
                    First Video FREE
                  </Badge>
                )}
              </div>

              <Card.Body className="d-flex flex-column">
                {/* Subject Name */}
                <Card.Title className="fw-bold mb-2" style={{ fontSize: '1.1rem' }}>
                  {course.subjectName}
                </Card.Title>

                {/* Degree Programme */}
                <div className="mb-2">
                  <small className="text-muted">
                    <i className="bi bi-mortarboard me-1"></i>
                    {course.degreeProgramme || 'General Studies'}
                  </small>
                </div>

                {/* University */}
                <div className="mb-3">
                  <small className="text-muted">
                    <i className="bi bi-building me-1"></i>
                    {course.university}
                  </small>
                </div>

                {/* Scholar Info */}
                <div className="mt-auto pt-3 border-top d-flex align-items-center">
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                    style={{ width: '36px', height: '36px', fontSize: '0.85rem', flexShrink: 0 }}
                  >
                    {course.scholarInitials}
                  </div>
                  <div>
                    <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                      {course.scholarName}
                    </div>
                    <small className="text-muted">Scholar</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Login Required Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <i className="bi bi-lock-fill text-primary" style={{ fontSize: '3rem' }}></i>
          <h5 className="mt-3 mb-2">Please Login to View Courses</h5>
          <p className="text-muted">
            You need to be logged in to access course content. The first video of each course is free!
          </p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="outline-secondary" onClick={() => setShowLoginModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => navigate('/login')}>
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Login
          </Button>
        </Modal.Footer>
      </Modal>

      {/* CSS for hover effects */}
      <style>{`
        .course-card:hover .play-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </Container>
  );
}

export default VideoPlaylist;
