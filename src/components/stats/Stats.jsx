import { Container, Row, Col, Card } from "react-bootstrap";

function Stats() {
  const features = [
    {
      icon: "bi-play-circle-fill",
      title: "First Video Free",
      description: "Try any course with the first video completely free. No commitment required!",
      color: "#10b981",
      bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    {
      icon: "bi-award-fill",
      title: "Expert Scholars",
      description: "Learn from verified top-performing students and academic professionals.",
      color: "#8b5cf6",
      bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
    },
    {
      icon: "bi-clock-fill",
      title: "Learn Anytime",
      description: "Access courses 24/7 on any device. Study at your own pace.",
      color: "#06b6d4",
      bgGradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
    },
    {
      icon: "bi-wallet2",
      title: "Affordable Pricing",
      description: "Quality education at student-friendly prices. Pay only for what you need.",
      color: "#f59e0b",
      bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    }
  ];

  return (
    <div className="features-section py-5" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
      <Container>
        <div className="text-center mb-5">
          <h2 className="text-white fw-bold display-6 mb-3">
            Why Choose <span style={{ color: '#8b5cf6' }}>UNICLIPS</span>?
          </h2>
          <p className="text-white-50 fs-5">The smarter way to learn from the best</p>
        </div>
        
        <Row className="g-4">
          {features.map((feature, index) => (
            <Col lg={3} md={6} key={index}>
              <Card 
                className="h-100 border-0 text-center feature-card"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease'
                }}
              >
                <Card.Body className="p-4">
                  <div 
                    className="feature-icon mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      background: feature.bgGradient,
                      boxShadow: `0 10px 30px ${feature.color}40`
                    }}
                  >
                    <i className={`bi ${feature.icon} text-white`} style={{ fontSize: '2rem' }}></i>
                  </div>
                  <h5 className="text-white fw-bold mb-3">{feature.title}</h5>
                  <p className="text-white-50 mb-0" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {feature.description}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        
        {/* Trust badges */}
        <div className="text-center mt-5 pt-4">
          <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap">
            <div className="d-flex align-items-center text-white-50">
              <i className="bi bi-shield-check text-success me-2 fs-4"></i>
              <span>Secure Payments</span>
            </div>
            {/* 24/7 Support and Top Rated - uncomment when ready
            <div className="d-flex align-items-center text-white-50">
              <i className="bi bi-headset text-info me-2 fs-4"></i>
              <span>24/7 Support</span>
            </div>
            <div className="d-flex align-items-center text-white-50">
              <i className="bi bi-star-fill text-warning me-2 fs-4"></i>
              <span>Top Rated</span>
            </div>
            */}
            <div className="d-flex align-items-center text-white-50">
              <i className="bi bi-patch-check-fill text-primary me-2 fs-4"></i>
              <span>Verified Scholars</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Stats;
