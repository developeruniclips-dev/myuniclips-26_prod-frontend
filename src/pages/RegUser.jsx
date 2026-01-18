// src/pages/RegUser.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Modal } from "react-bootstrap";
import axios from "axios";
import teacher from "../assets/teacher.png";
import LearnerTermsModal from "../components/terms/LearnerTermsModal";

function RegisterPage() {
  const navigate = useNavigate();
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setShowModal(false);
    if (modalSuccess) navigate("/login");
  };

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setShowTermsModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setShowTermsModal(true);
      return;
    }

    if (password !== confirmPassword) {
      setModalMessage("Passwords do not match");
      setModalSuccess(false);
      setShowModal(true);
      return;
    }

    const payload = {
      fname,
      lname,
      email,
      password,
      termsAccepted: true
    };

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/auth`,
        payload
      );
      setModalMessage("Registration successful!");
      setModalSuccess(true);
      setShowModal(true);
    } catch (err) {
      setModalMessage(err.response?.data?.message || "Something went wrong");
      setModalSuccess(false);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${teacher})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Row>
        <Col md={12}>
          <Card style={{ width: "25rem" }}>
            <Card.Body>
              <Card.Title>Create Account</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={lname}
                    onChange={(e) => setLname(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="terms-checkbox"
                    checked={termsAccepted}
                    onChange={() => setShowTermsModal(true)}
                    label={
                      <span>
                        I agree to the{" "}
                        <span 
                          className="text-primary" 
                          style={{ cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                        >
                          Terms and Conditions
                        </span>
                      </span>
                    }
                  />
                </Form.Group>

                <Button type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Terms Modal */}
      <LearnerTermsModal
        show={showTermsModal}
        onHide={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
        context="signup"
      />

      {/* Result Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{modalSuccess ? "Success" : "Error"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            {modalSuccess ? "Go to Login" : "Close"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default RegisterPage;
