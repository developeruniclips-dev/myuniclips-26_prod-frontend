import { Container, Row, Col } from "react-bootstrap";
import description from '../../../assets/description.png'

function Description() {
    return(
        <>
           <section className="description-section py-5">
            <Container>
                <Row className="align-items-center">
                {/* Text Column */}
                <Col md={6} className="mb-4 mb-md-0">
                    <h1 className="fw-bold mb-4 text-primary">About UniClips</h1>
                    <p className="lead text-secondary lh-lg">
                    <strong>UniClips</strong> is an EdTech platform delivering
                    short, class-focused video courses aligned with local university syllabi. <br /><br />
                    We tackle the problem of generalized learning by empowering proven
                    scholars — students who have mastered the course — to create
                    high-quality, on-demand content for their peers. <br /><br />
                    Our mission is to make learning <strong>easier, more local, and more affordable</strong>.
                    </p>
                </Col>

                {/* Image Column */}
                <Col md={6} className="text-center">
                    <img
                    src={description}
                    alt="Student learning"
                    className="img-fluid rounded-4 shadow-lg"
                    style={{ maxHeight: "400px", objectFit: "cover" }}
                    />
                </Col>
                </Row>
            </Container>
            </section>
        </>
    )
}

export default Description;