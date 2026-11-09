import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/temp";

function CallToAction() {
  const { user } = useAuth();

  return (
    <div 
      className="cta-section py-5 my-5"
      style={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        borderRadius: '30px',
        margin: '0 20px'
      }}
    >
      <Container>
        <Row className="align-items-center py-4">
          <Col lg={8} className="text-white mb-4 mb-lg-0">
            <h2 className="display-5 fw-bold mb-3">
              Ready to Start Learning?
            </h2>
            <p className="fs-5 opacity-90 mb-0">
              Join UNICLIPS today and get access to expert-led courses. 
              Your first video is always free!
            </p>
          </Col>
          <Col lg={4} className="text-lg-end">
            {!user ? (
              <div className="d-flex gap-3 justify-content-lg-end flex-wrap">
                  <Link to="/register"
                    className="btn btn-light btn-lg px-4 fw-semibold"
                    style={{ borderRadius: '25px' }}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Sign Up Free
                  </Link>
                  <Link to="/all-videos"
                    className="btn btn-outline-light btn-lg px-4 fw-semibold"
                    style={{ borderRadius: '25px' }}
                  >
                    Browse Courses
                  </Link>
              </div>
            ) : (
              <div className="d-flex gap-3 justify-content-lg-end flex-wrap">
                  <Link to="/all-videos"
                    className="btn btn-light btn-lg px-4 fw-semibold"
                    style={{ borderRadius: '25px' }}
                  >
                    <i className="bi bi-collection-play me-2"></i>
                    Explore Courses
                  </Link>
                  <Link to="/become-scholar"
                    className="btn btn-outline-light btn-lg px-4 fw-semibold"
                    style={{ borderRadius: '25px' }}
                  >
                    Become a Scholar
                  </Link>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CallToAction;
