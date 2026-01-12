// src/components/FeaturedCourses.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Modal } from "react-bootstrap";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/temp";
import './featuredCourses.css';

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

function FeaturedCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/all-videos`);
        // Get approved videos
        const approvedVideos = res.data.videos.filter(video => video.approved === 1);
        
        // Group by subject_id to get unique courses
        const coursesMap = {};
        approvedVideos.forEach(video => {
          if (!coursesMap[video.subject_id]) {
            coursesMap[video.subject_id] = {
              subject_id: video.subject_id,
              subject_name: video.subject_name,
              scholar_fname: video.scholar_fname,
              scholar_lname: video.scholar_lname,
              university: video.university,
              degree: video.degree,
              firstVideo: video,
              videoCount: 1,
              description: video.description
            };
          } else {
            coursesMap[video.subject_id].videoCount++;
            // Keep the first video (lowest sequence_index)
            if (video.sequence_index < coursesMap[video.subject_id].firstVideo.sequence_index) {
              coursesMap[video.subject_id].firstVideo = video;
            }
          }
        });
        
        // Convert to array and shuffle for randomness
        const coursesArray = Object.values(coursesMap);
        const shuffled = coursesArray.sort(() => Math.random() - 0.5);
        
        // Pick 4 random courses
        setCourses(shuffled.slice(0, 4));
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseClick = (subjectId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    navigate(`/course/${subjectId}`);
  };

  return (
    <Container className="my-5 py-5">
      <div className="text-center mb-5">
        <h2 className="section-title gradient-text d-inline-block">Featured Courses</h2>
        <p className="text-muted fs-5 mt-3">Start learning with our most popular courses - First video always free!</p>
      </div>
      
      <Row className="g-4 justify-content-center">
        {courses.map((course) => (
          <Col lg={3} md={6} sm={12} key={course.subject_id}>
            <Card 
              className="h-100 border-0 course-card shadow-sm" 
              style={{ cursor: 'pointer' }}
              onClick={() => handleCourseClick(course.subject_id)}
            >
              <div 
                className="position-relative overflow-hidden" 
                style={{ 
                  height: '180px'
                }}
              >
                <img 
                  src={getVimeoThumbnail(getVimeoId(course.firstVideo?.video_url))}
                  alt={course.subject_name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
                  }}
                />
                <div 
                  className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{ top: 0, left: 0, background: 'rgba(0,0,0,0.3)' }}
                >
                  <i className="bi bi-play-circle-fill text-white" style={{ fontSize: '4rem', opacity: 0.9 }}></i>
                </div>
                <Badge bg="success" className="position-absolute top-0 end-0 m-2">
                  FIRST VIDEO FREE
                </Badge>
                <Badge bg="dark" className="position-absolute bottom-0 start-0 m-2">
                  <i className="bi bi-collection-play me-1"></i>
                  {course.videoCount} video{course.videoCount > 1 ? 's' : ''}
                </Badge>
              </div>
              <Card.Body className="d-flex flex-column">
                <Badge bg="light" text="dark" className="mb-2 align-self-start">
                  {course.degree || 'Course'}
                </Badge>
                <Card.Title className="mb-2 fw-bold" style={{ fontSize: '1.1rem' }}>
                  {course.subject_name}
                </Card.Title>
                <p className="text-muted small mb-3" style={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {course.description}
                </p>
                <div className="mt-auto">
                  <div className="d-flex align-items-center mb-3">
                    <div 
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                      style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}
                    >
                      {course.scholar_fname?.[0]}{course.scholar_lname?.[0]}
                    </div>
                    <div>
                      <small className="d-block text-dark fw-semibold">
                        {course.scholar_fname} {course.scholar_lname}
                      </small>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {course.university || 'Scholar'}
                      </small>
                    </div>
                  </div>
                  
                  <Button variant="primary" className="w-100">
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    View Course
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      {courses.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">No featured courses available yet. Check back soon!</p>
        </div>
      )}
      
      <div className="text-center mt-5">
        <Link to="/all-videos">
          <Button variant="outline-primary" size="lg" className="px-5">
            Explore All Courses →
          </Button>
        </Link>
      </div>

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
    </Container>
  );
}

export default FeaturedCourses;
