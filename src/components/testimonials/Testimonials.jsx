import { Container, Row, Col, Card } from "react-bootstrap";

function Testimonials() {
  const testimonials = [
    {
      name: "Anusshika Nallahandi",
      role: "Co-founder, UniClips",
      avatar: "AN",
      quote: "Our goal with UniClips is not to replace universities, but to support students where traditional learning struggles. Short, clear explanations, structured by the actual syllabus, make learning less stressful and more effective. We're building UniClips slowly, carefully, and with students at the center.",
      color: "#8b5cf6",
      isFounder: false
    },
    {
      name: "Abdul-Satar Salisu",
      role: "Founder, UniClips",
      avatar: "AS",
      quote: "UniClips was born from my own struggle as a university student. Long lectures, scattered materials, and no simple way to revise. With UniClips, I can learn a full course in short, focused videos made by students who actually understand what was taught in class. This is the platform I wish I had from my first year.",
      color: "#6366f1",
      isFounder: true
    },
    {
      name: "Kossi Aziadzo",
      role: "UniClips Scholar",
      avatar: "KA",
      quote: "Teaching on UniClips gives me a way to help other students using the same materials I learned with. I focus on explaining concepts simply, without pressure, just the way I would explain them to a friend. Knowing that students can learn faster — and that my work is valued — is what makes UniClips special.",
      color: "#06b6d4",
      isFounder: false
    }
  ];

  return (
    <div className="testimonials-section py-5" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)' }}>
      <Container>
        <div className="text-center mb-5">
          <span 
            className="badge rounded-pill px-3 py-2 mb-3" 
            style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              fontSize: '0.85rem',
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}
          >
            <i className="bi bi-chat-quote me-2"></i>
            TESTIMONIALS
          </span>
          <h2 
            className="fw-bold mb-3" 
            style={{ 
              fontSize: '2.5rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Meet the Team Behind UniClips
          </h2>
          <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '550px' }}>
            Built by students, for students — hear directly from our founders and scholars
          </p>
        </div>
        
        <Row className="g-4 justify-content-center">
          {testimonials.map((testimonial, index) => (
            <Col lg={4} md={6} key={index}>
              <Card 
                className="h-100 border-0 testimonial-card"
                style={{ 
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  boxShadow: testimonial.isFounder 
                    ? '0 8px 32px rgba(99, 102, 241, 0.2)' 
                    : '0 4px 20px rgba(0,0,0,0.08)',
                  border: testimonial.isFounder ? '2px solid #6366f1' : 'none',
                  transform: testimonial.isFounder ? 'scale(1.02)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = testimonial.isFounder ? 'scale(1.04) translateY(-4px)' : 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = testimonial.isFounder ? 'scale(1.02)' : 'translateY(0)';
                  e.currentTarget.style.boxShadow = testimonial.isFounder 
                    ? '0 8px 32px rgba(99, 102, 241, 0.2)' 
                    : '0 4px 20px rgba(0,0,0,0.08)';
                }}
              >
                <Card.Body className="p-4 d-flex flex-column">
                  {/* Header with Quote Icon and Role Badge */}
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div 
                      className="rounded-3 d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        background: `linear-gradient(135deg, ${testimonial.color}15 0%, ${testimonial.color}25 100%)`,
                      }}
                    >
                      <i 
                        className="bi bi-quote" 
                        style={{ fontSize: '1.5rem', color: testimonial.color }}
                      ></i>
                    </div>
                    {testimonial.isFounder && (
                      <span 
                        className="badge rounded-pill px-3 py-2"
                        style={{ 
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          fontSize: '0.75rem'
                        }}
                      >
                        <i className="bi bi-star-fill me-1"></i>
                        FOUNDER
                      </span>
                    )}
                  </div>
                  
                  {/* Quote Text */}
                  <p className="flex-grow-1 mb-4" style={{ 
                    fontSize: '0.95rem', 
                    color: '#475569', 
                    lineHeight: 1.75,
                    fontWeight: '400'
                  }}>
                    "{testimonial.quote}"
                  </p>
                  
                  {/* Author - at bottom */}
                  <div className="d-flex align-items-center pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold me-3"
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        background: `linear-gradient(135deg, ${testimonial.color} 0%, ${testimonial.color}dd 100%)`,
                        fontSize: '0.95rem',
                        boxShadow: `0 4px 12px ${testimonial.color}40`
                      }}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h6 className="fw-semibold mb-0" style={{ color: '#1e293b' }}>{testimonial.name}</h6>
                      <small style={{ color: '#64748b' }}>{testimonial.role}</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Trust Indicators */}
        <div className="text-center mt-5 pt-4">
          <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap">
            <div className="d-flex align-items-center">
              <i className="bi bi-mortarboard-fill me-2" style={{ color: '#6366f1', fontSize: '1.25rem' }}></i>
              <span className="text-muted">Built by Students</span>
            </div>
            <div className="d-flex align-items-center">
              <i className="bi bi-lightning-fill me-2" style={{ color: '#fbbf24', fontSize: '1.25rem' }}></i>
              <span className="text-muted">Short, Focused Videos</span>
            </div>
            <div className="d-flex align-items-center">
              <i className="bi bi-book-fill me-2" style={{ color: '#8b5cf6', fontSize: '1.25rem' }}></i>
              <span className="text-muted">Syllabus-Aligned</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Testimonials;
