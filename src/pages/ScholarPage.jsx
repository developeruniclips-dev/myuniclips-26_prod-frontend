import { Container, Row, Col, Button, Card } from "react-bootstrap";
import graduation from '../assets/graduation.png'

function ScholarPage() {
    return(
       <Container className="py-5 mt-5">
      {/* Hero Section */}
      <Row className="align-items-center mb-5">
        <Col md={6}>
          <h1>Join as a Scholar — Teach, Inspire, Earn</h1>
          <p>
            Create educational content, help fellow students, and earn
            compensation.
          </p>
          <Button variant="primary" size="lg">
            Become a Scholar
          </Button>
        </Col>
        <Col md={6}>
          <img
            src={graduation}
            alt="Scholar illustration"
            className="img-fluid"
          />
        </Col>
      </Row>

      {/* How It Works */}
      <h2 className="text-center mb-4">How It Works</h2>
      <Row className="text-center mb-5">
        <Col md={4}>
          <i className="bi bi-journal-text fs-1 text-primary"></i>
          <h5 className="mt-3">Pick a course</h5>
        </Col>
        <Col md={4}>
          <i className="bi bi-camera-video fs-1 text-primary"></i>
          <h5 className="mt-3">Create videos</h5>
        </Col>
        <Col md={4}>
          <i className="bi bi-cash-stack fs-1 text-primary"></i>
          <h5 className="mt-3">Get paid</h5>
        </Col>
      </Row>

      {/* Testimonial */}
      <Card className="p-4 shadow-sm border-0 text-center">
        <blockquote className="blockquote mb-0">
          <p>
            “I love sharing my knowledge and helping other students succeed.
            Plus, the extra income is a great bonus!”
          </p>
          <footer className="blockquote-footer mt-2">
            Michael T. Scholar
          </footer>
        </blockquote>
      </Card>

      <div className="text-center mt-4">
        <Button variant="primary" size="lg">
          Become a Scholar
        </Button>
      </div>
    </Container>
    )
}

export default ScholarPage;