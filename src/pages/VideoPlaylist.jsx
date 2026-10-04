import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Modal, Badge, Form, InputGroup } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/temp";
import axios from "axios";
import { courseCategoryLabel } from '../utils/courseClassification.mjs';

import { publishedCourses, filterPublishedCourses } from '../utils/publicCourses.mjs';

function VideoPlaylist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [universities, setUniversities] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [locationError, setLocationError] = useState('');
  const [programmesLoading, setProgrammesLoading] = useState(false);
  const api = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const [showLoginModal, setShowLoginModal] = useState(false);
  const searchQuery = searchParams.get('search') || '';
  const generalOnly = searchParams.get('category') === 'general';

  const university = searchParams.get('university') || '';
  const programme = university ? searchParams.get('programme') || '' : '';
  const selectedUniversity = universities.find(u => String(u.id) === university);
  const filteredCourses = filterPublishedCourses(courses, {search:searchQuery, university, programme, general:generalOnly});
  const setFilter = (name, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name,value); else next.delete(name);
    if (name === 'university') next.delete('programme');
    setSearchParams(next);
  };
  useEffect(() => {
    let active = true;
    setLocationError('');
    axios.get(`${api}/locations/universities?available=1`).then(r => { if(active) setUniversities(r.data); })
      .catch(() => { if(active) setLocationError('Unable to load academic filters. Try again.'); });
    return () => { active = false; };
  }, [api,retry]);
  useEffect(() => {
    let active = true; setProgrammes([]); setProgrammesLoading(Boolean(university));
    if (university) axios.get(`${api}/locations/programs/by-university/${university}`)
      .then(r => { if(active) { setProgrammes(r.data); setLocationError(''); } })
      .catch(() => { if(active) setLocationError('Unable to load programmes. Try again.'); })
      .finally(() => { if(active) setProgrammesLoading(false); });
    return () => { active = false; };
  },[api,university,retry]);

  // Update URL when search changes
  const handleSearchChange = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set('search', value);
    else next.delete('search');
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    let active = true; setLoading(true); setRequestError(false);
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/videos/all-videos`);
        const videos = res.data.videos || [];
        
        if (active) setCourses(publishedCourses(videos));
      } catch (err) {
        if (active) setRequestError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchVideos();
    return () => { active = false; };
  }, [retry]);

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
        <div className="d-flex flex-wrap gap-2 align-items-start">
        <InputGroup style={{ maxWidth: '500px' }}>
          <Form.Control
            id="course-search" aria-label="Search courses"
            type="text"
            placeholder="Search by subject, scholar, degree, or university..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ padding: '0.75rem 1rem' }}
          />
          {locationError && <p role="alert">{locationError} <Button variant="link" onClick={() => setRetry(n => n+1)}>Try Again</Button></p>}
        {searchQuery && (
            <Button 
              variant="outline-secondary" aria-label="Clear search"
              onClick={() => handleSearchChange('')}
            >
              <i className="bi bi-x-lg"></i>
            </Button>
          )}
          <Button variant="primary" aria-label="Search courses" onClick={() => document.getElementById('course-search').focus()}>
            <i className="bi bi-search"></i>
          </Button>
        </InputGroup>
        <Form.Select aria-label="University" style={{maxWidth:'360px'}} value={university} onChange={e => setFilter('university',e.target.value)}>
          <option value="">All Universities</option>{universities.map(u => <option key={u.id} value={u.id}>{u.name}{u.short_name ? ` (${u.short_name})` : ''}</option>)}
        </Form.Select>
        <Form.Select aria-label="Programme" style={{maxWidth:'360px'}} value={programme} disabled={!university || programmesLoading} onChange={e => setFilter('programme',e.target.value)}>
          <option value="">{programmesLoading ? 'Loading programmes...' : 'All Programmes'}</option>{programmes.map(p => <option key={p.program} value={p.program}>{p.program}</option>)}
        </Form.Select>
        <Form.Select aria-label="Course category" style={{ maxWidth: '270px', padding: '0.75rem 1rem' }}
          value={generalOnly ? 'general' : 'all'} onChange={event => {
            const next = new URLSearchParams(searchParams);
            if (event.target.value === 'general') next.set('category', 'general');
            else next.delete('category');
            setSearchParams(next);
          }}>
          <option value="all">All Courses</option>
          <option value="general">General University Courses</option>
        </Form.Select>
        </div>
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

      {requestError && <Card className="border-0 shadow-sm text-center py-5"><Card.Body><h3>We couldn't load courses right now.</h3><Button onClick={() => setRetry(n => n+1)}>Try Again</Button></Card.Body></Card>}
      {/* Empty State - No courses at all */}
      {!loading && !requestError && courses.length === 0 && (
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
      {!loading && !requestError && courses.length > 0 && filteredCourses.length === 0 && (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <div className="mb-4">
              <i className="bi bi-search" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
            </div>
            <h4 className="fw-bold mb-3">{programme ? 'No published courses for this programme yet.' : selectedUniversity && !courses.some(c => String(c.universityId) === university) ? `No published courses at ${selectedUniversity.short_name || selectedUniversity.name} yet.` : 'No courses found'}</h4>
            <p className="text-muted mb-4">
              {selectedUniversity && !courses.some(c => String(c.universityId) === university) ? 'New courses will appear here as Scholars begin publishing.' : 'No published courses match these filters. Try another search or category.'}
            </p>
            <Button 
              variant="outline-primary"
              onClick={() => setSearchParams({})}
            >
              Clear Filters
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Course Grid */}
      {!loading && !requestError && <Row>
        {filteredCourses.map((course) => (
          <Col lg={4} md={6} className="mb-4" key={course.id}>
            <Card 
              className="h-100 shadow-sm course-card" 
              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
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
                    e.target.src = '/course-fallback.svg';
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
                    {courseCategoryLabel(course, course.degreeProgramme || 'General Studies')}
                  </small>
                </div>

                {course.is_general_university_course && <details className="mb-2" onClick={e => e.stopPropagation()}><summary className="small">View {course.applicable_programmes.length} applicable programmes</summary><ul className="small" style={{maxHeight:'140px',overflowY:'auto'}}>{course.applicable_programmes.map(p => <li key={p}>{p}</li>)}</ul></details>}
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
                <Button variant="outline-primary" className="mt-3" onClick={() => handleCourseClick(course)} aria-label={`Start learning ${course.subjectName}`}>Start Learning</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>}

      {/* Login Required Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Start Learning</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <i className="bi bi-lock-fill text-primary" style={{ fontSize: '3rem' }}></i>
          <h5 className="mt-3 mb-2">Sign in to start learning</h5>
          <p className="text-muted">
            Sign in or create a free account to access this course. The first video is free.
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
          <Button variant="outline-primary" onClick={() => navigate('/register')}>Create Account</Button>
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
