import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function Whyvle() {
    return(
        <Container className="my-5">
            <Row>
                <Col md={6}>
                    <blockquote className="blockquote">
                        <p>
                        <span className="fs-1 text-info">❝</span> 
                        UNICLIPS has been a game changer in my studies. 
                        The video content is easy to follow and makes tough topics simple.
                        </p>
                        <footer className="blockquote-footer">Emil Hollihen</footer>
                    </blockquote>
                </Col>
                <Col md={6}>
                <h3 className="fw-bold">Why UNICLIPS?</h3>
                <p>
                    Our aim is to provide high-quality learning experiences with
                    professional instructors. Get access to curated programs that help
                    you excel in your degree and career.
                </p>
                <Link to="/learn-more" className="text-info fw-bold">
                    Learn More →
                </Link>
                </Col>
            </Row>
        </Container>
    )
}

export default Whyvle;