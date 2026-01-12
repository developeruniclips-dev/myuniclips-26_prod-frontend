import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
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

function MyLibrary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchLibrary = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/library/my-library`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setLibrary(res.data.library || []);
      } catch (err) {
        console.error('Error fetching library:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [user, navigate]);

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
    } catch (err) {
      console.error('Error removing from library:', err);
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center" style={{ minHeight: '70vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your library...</p>
      </Container>
    );
  }

  return (
    <Container className="my-5" style={{ minHeight: '70vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-collection-play me-2"></i>
            My Library
          </h2>
          <p className="text-muted mb-0">Your saved courses and learning progress</p>
        </div>
        <Link to="/all-videos">
          <Button variant="outline-primary">
            <i className="bi bi-plus-lg me-2"></i>
            Browse Courses
          </Button>
        </Link>
      </div>

      {library.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <div className="mb-4">
              <i className="bi bi-bookshelf" style={{ fontSize: '5rem', color: '#6366f1' }}></i>
            </div>
            <h3 className="fw-bold mb-3">Your Library is Empty</h3>
            <p className="text-muted mb-4">
              Start building your learning journey by adding courses to your library.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate('/all-videos')}>
              <i className="bi bi-search me-2"></i>
              Explore Courses
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {library.map((course) => (
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
                      title="Remove from library"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default MyLibrary;
