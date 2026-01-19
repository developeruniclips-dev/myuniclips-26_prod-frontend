import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer-section py-5" style={{ background: '#1e293b' }}>
      <Container>
        <Row className="g-4">
          {/* Brand */}
          <Col lg={4} md={6}>
            <h4 className="text-white fw-bold mb-3">🎓 UNICLIPS</h4>
            <p className="text-white-50 mb-4">
              Empowering learners with world-class education from expert scholars. 
              Learn anywhere, anytime.
            </p>
            {/* Social links - uncomment when actual links are ready
            <div className="social-links d-flex gap-3">
              <a href="#" className="text-white-50 fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white-50 fs-5"><i className="bi bi-twitter"></i></a>
              <a href="#" className="text-white-50 fs-5"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-white-50 fs-5"><i className="bi bi-linkedin"></i></a>
              <a href="#" className="text-white-50 fs-5"><i className="bi bi-youtube"></i></a>
            </div>
            */}
          </Col>
          
          {/* Quick Links */}
          <Col lg={2} md={6}>
            <h6 className="text-white fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-white-50 text-decoration-none" style={{ cursor: 'pointer' }}>Home</a>
              </li>
              <li className="mb-2">
                <Link to="/all-videos" className="text-white-50 text-decoration-none">Courses</Link>
              </li>
              <li className="mb-2">
                <Link to="/become-scholar" className="text-white-50 text-decoration-none">Scholar</Link>
              </li>
              <li className="mb-2">
                <Link to="/aboutUs" className="text-white-50 text-decoration-none">About Us</Link>
              </li>
            </ul>
          </Col>
          
          {/* Support */}
          <Col lg={2} md={6}>
            <h6 className="text-white fw-bold mb-3">Support</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/aboutUs#faq" className="text-white-50 text-decoration-none">FAQs</Link>
              </li>
              <li className="mb-2">
                <Link to="/aboutUs#contact" className="text-white-50 text-decoration-none">Contact Us</Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy-policy" className="text-white-50 text-decoration-none">Privacy Policy</Link>
              </li>
            </ul>
          </Col>
          
          {/* Contact */}
          <Col lg={4} md={6}>
            <h6 className="text-white fw-bold mb-3">Get in Touch</h6>
            <ul className="list-unstyled text-white-50">
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                <a href="mailto:support@uniclips.com" className="text-white-50 text-decoration-none">support@uniclips.com</a>
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                <a href="tel:+358451723342" className="text-white-50 text-decoration-none">+358 45 1723342</a>
              </li>
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Kaartokatu+2,+11100+Riihim%C3%A4ki,+Finland" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white-50 text-decoration-none"
                >
                  Kaartokatu 2, 11100 Riihimäki
                </a>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4 border-secondary" />
        
        <Row className="align-items-center">
          <Col md={6} className="text-white-50 small">
            © 2026 UNICLIPS. All rights reserved.
          </Col>
          <Col md={6} className="text-md-end text-white-50 small mt-2 mt-md-0">
            Made with <i className="bi bi-heart-fill text-danger"></i> for learners worldwide
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
