import { useState } from "react";
import { Container, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import heroImg from '../../assets/study.jpg';

function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/all-videos?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/all-videos');
    }
  };

  return (
    <div className="hero-section">
      <Container className="position-relative" style={{ zIndex: 1 }}>
        {/* Top Section - Text Content (Centered) */}
        <Row className="pt-5 justify-content-center">
          <Col lg={10} className="text-white text-center">
            <h1 className="display-1 fw-bold mb-4 mx-auto" style={{ fontSize: '4.5rem', lineHeight: 1.1, maxWidth: '700px' }}>
              Learn from the Best.<br />
              <span style={{ color: '#06b6d4' }}>Anywhere.</span> <span style={{ color: '#10b981' }}>Anytime.</span>
            </h1>
            <p className="fs-3 mb-4 opacity-90 mx-auto" style={{ maxWidth: '700px' }}>
              Access world-class education from top scholars. Start your journey today.
            </p>
            
            {/* V-shape aligned elements */}
            <div className="d-flex flex-column align-items-center">
              <Form onSubmit={handleSearch} style={{ maxWidth: '650px', width: '100%' }}>
                <InputGroup className="search-box mb-3">
                  <Form.Control
                    type="text"
                    placeholder="What do you want to learn today?"
                    className="border-0"
                    style={{ fontSize: '1.2rem', padding: '1.5rem' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" variant="primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
                    <i className="bi bi-search"></i> Search
                  </Button>
                </InputGroup>
              </Form>
              
              <Link to="/all-videos" className="mb-5">
                <Button variant="light" size="lg" className="px-4 py-2" style={{ fontSize: '1.1rem' }}>
                  <i className="bi bi-collection-play me-2"></i>
                  Explore Courses
                </Button>
              </Link>
            </div>
          </Col>
        </Row>
        
        {/* Bottom Section - Image */}
        <Row className="mt-4">
          <Col lg={10} className="mx-auto">
            <div className="position-relative">
              <img
                src={heroImg}
                alt="Student learning"
                className="img-fluid rounded-4 shadow-lg w-100"
                style={{ 
                  maxHeight: '400px', 
                  objectFit: 'cover',
                  objectPosition: 'center top'
                }}
              />
              {/* Overlay badges */}
              <div 
                className="position-absolute d-none d-md-flex align-items-center gap-2 bg-white rounded-pill px-4 py-2 shadow"
                style={{ bottom: '20px', left: '20px' }}
              >
                <i className="bi bi-play-circle-fill text-success fs-4"></i>
                <span className="fw-bold">First Video Always Free!</span>
              </div>
              <div 
                className="position-absolute d-none d-md-flex align-items-center gap-2 bg-white rounded-pill px-4 py-2 shadow"
                style={{ bottom: '20px', right: '20px' }}
              >
                <i className="bi bi-star-fill text-warning fs-4"></i>
                <span className="fw-bold">Top-Rated Scholars</span>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Hero;