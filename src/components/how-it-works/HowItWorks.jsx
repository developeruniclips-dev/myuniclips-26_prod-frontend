import { Container, Row, Col } from "react-bootstrap";

function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: "bi-person-plus-fill",
      title: "Create Your Account",
      description: "Sign up for free and set up your learner profile in just a few minutes.",
      color: "#6366f1"
    },
    {
      number: "02", 
      icon: "bi-search",
      title: "Browse Courses",
      description: "Explore our catalog of courses from expert scholars. First video is always free!",
      color: "#8b5cf6"
    },
    {
      number: "03",
      icon: "bi-play-btn-fill",
      title: "Start Learning",
      description: "Watch high-quality video lessons at your own pace, anywhere, anytime.",
      color: "#06b6d4"
    }
  ];

  return (
    <div className="how-it-works-section py-5 my-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-title gradient-text d-inline-block">How It Works</h2>
          <p className="text-muted fs-5 mt-3">Get started with UNICLIPS in three simple steps</p>
        </div>
        
        <Row className="g-4 position-relative">
          {/* Connection Line */}
          <div 
            className="d-none d-lg-block position-absolute" 
            style={{ 
              top: '80px', 
              left: '20%', 
              right: '20%', 
              height: '3px', 
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
              zIndex: 0
            }}
          />
          
          {steps.map((step, index) => (
            <Col lg={4} md={6} key={index}>
              <div 
                className="step-card text-center p-4 bg-white rounded-4 shadow-sm position-relative h-100"
                style={{ zIndex: 1 }}
              >
                <div 
                  className="step-number position-absolute"
                  style={{ 
                    top: '-20px', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}cc 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    boxShadow: `0 4px 15px ${step.color}40`
                  }}
                >
                  {step.number}
                </div>
                
                <div 
                  className="step-icon mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle mt-4"
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    background: `${step.color}15`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className={`bi ${step.icon}`} style={{ fontSize: '2rem', color: step.color }}></i>
                </div>
                
                <h4 className="fw-bold mb-3">{step.title}</h4>
                <p className="text-muted mb-0">{step.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default HowItWorks;
