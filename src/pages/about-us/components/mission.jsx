import { Container, Row, Col } from "react-bootstrap";
import mission from '../../../assets/mission.jpg';
import './mission.css';


function Mission() {
    return(
        <section className="vision-mission-section py-5">
      <Container>
        <Row className="align-items-center">
          {/* Image Column */}
          <Col md={5} className="text-center mb-4 mb-md-0">
            <img
              src={mission}
              alt="Vision and Mission"
              className="img-fluid rounded-4 shadow-lg"
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
          </Col>

          {/* Text Column */}
          <Col md={7}>
            <h1 className="fw-bold text-primary mb-4 text-center text-md-start">
              Our Vision & Mission
            </h1>

            {/* Vision */}
            <div className="mb-4">
              <h4 className="fw-semibold text-dark mb-2">🌍 Vision</h4>
              <p className="lead text-secondary lh-lg">
                <strong>What we aim to achieve:</strong> To make reliable,
                high-impact learning content accessible to all university
                students — establishing <strong>UniClips</strong> as the
                standard resource for both <em>first-time comprehension</em> and
                <em> final course review</em>.
              </p>
            </div>

            {/* Mission */}
            <div>
              <h4 className="fw-semibold text-dark mb-2">🎯 Mission</h4>
              <p className="lead text-secondary lh-lg">
                <strong>How we make it happen:</strong> By closing the gap
                between global e-learning and local university needs through
                <strong> precise, peer-to-peer, syllabus-aligned, and affordable video content</strong> — created by proven scholars who guarantee mastery of the curriculum.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
    )
}

export default Mission;