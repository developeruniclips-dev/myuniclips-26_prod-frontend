import { Container, Row, Col, Card } from "react-bootstrap";
import { Mail, MapPin, Users } from "lucide-react";
import './contactus.css';

function ContactUs() {
    return(
        <section className="contact-section py-5">
            <Container>
                <h1 className="fw-bold text-primary text-center mb-5">
                Contact Details
                </h1>

                <Row className="justify-content-center mb-4">
                {/* Team Lead */}
                <Col md={5} className="mb-4">
                    <Card className="shadow-sm contact-card p-3 border-0 h-100">
                    <Card.Body>
                        <Users className="icon mb-3 text-primary" size={32} />
                        <h5 className="fw-semibold">Abdul-Satar Salisu</h5>
                        <p className="text-muted mb-1">Team Lead</p>
                        <p className="mb-0">
                        <Mail className="me-2 text-secondary" size={18} />
                        <a
                            href="mailto:satarworks@gmail.com"
                            className="contact-link"
                        >
                            satarworks@gmail.com
                        </a>
                        </p>
                    </Card.Body>
                    </Card>
                </Col>

                {/* IT Dev */}
                <Col md={5} className="mb-4">
                    <Card className="shadow-sm contact-card p-3 border-0 h-100">
                    <Card.Body>
                        <Users className="icon mb-3 text-primary" size={32} />
                        <h5 className="fw-semibold">Anushika Nallahandi</h5>
                        <p className="text-muted mb-1">IT Developer</p>
                        <p className="mb-0">
                        <Mail className="me-2 text-secondary" size={18} />
                        <a
                            href="mailto:anushikadilmini@gmail.com"
                            className="contact-link"
                        >
                            anushikadilmini@gmail.com
                        </a>
                        </p>
                    </Card.Body>
                    </Card>
                </Col>
                </Row>

                <Row>
                <Col className="text-center">
                    <p className="mt-4">
                    <MapPin className="me-2 text-primary" size={18} />
                    <strong>Address:</strong>{" "}
                    <a 
                        href="https://www.google.com/maps/search/?api=1&query=Kaartokatu+2,+11100+Riihim%C3%A4ki,+Finland"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                    >
                        Kaartokatu 2, 11100 Riihimäki, Finland
                    </a>
                    </p>
                    <p>
                    <strong>Phone:</strong>{" "}
                    <a href="tel:+358451723342" className="text-decoration-none">+358 45 1723342</a>
                    </p>
                </Col>
                </Row>
            </Container>
        </section>
    )
}

export default ContactUs;