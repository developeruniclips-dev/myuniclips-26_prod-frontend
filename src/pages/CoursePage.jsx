import { Container, Row, Col, Button, ListGroup } from "react-bootstrap";
import teacher from '../assets/teacher.png';
import student from '../assets/students.png'

function CoursePage() {
  return (
    <Container className="py-5">
      {/* Course Header */}
      <Row className="mb-5">
        <Col md={8}>
          <h1>Introduction to Physics</h1>
          <div className="d-flex align-items-center mb-3">
            <img
              src={teacher}
              alt="Scholar"
              className="rounded-circle me-3"
              width="80"
              height="80"
            />
            <div>
              <strong>Scholar</strong>
              <p className="mb-0">Sarah K.</p>
            </div>
          </div>
          <h4>About the Course</h4>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lacinia
            dalsque an ofianis edio eiusmod ulutic, ut eleifena.
          </p>
        </Col>
        <Col md={4}>
          <img
            src={student}
            alt="Course illustration"
            className="img-fluid"
          />
        </Col>
      </Row>

      {/* Course Content */}
      <h3>Course Content</h3>
      <ListGroup className="mb-4">
        <ListGroup.Item className="d-flex justify-content-between align-items-center">
          <span>▶️ Session 1: Basics of Mechanics</span>
          <small>4 hours</small>
        </ListGroup.Item>
        <ListGroup.Item className="d-flex justify-content-between align-items-center">
          <span>▶️ Session 2: Tautamenomatics</span>
          <small>Duration</small>
        </ListGroup.Item>
      </ListGroup>

      {/* Upcoming Sessions */}
      <Row className="align-items-center">
        <Col>
          <h4>Upcoming Sessions</h4>
          <ListGroup>
            <ListGroup.Item>▶️ Session 3: Thermodynamics</ListGroup.Item>
          </ListGroup>
        </Col>
        <Col className="text-end">
          <Button variant="primary" size="lg">
            Enroll Now
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default CoursePage;
