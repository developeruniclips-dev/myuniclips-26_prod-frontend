// src/pages/login/ForgotPassword.jsx
import React, { useState } from "react";
import { Button, Form, Card, Container, Row, Col, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [contactSupport, setContactSupport] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setContactSupport(false);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/password/forgot`,
                { email }
            );

            if (response.data.contactSupport) {
                setContactSupport(true);
                setError(response.data.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            if (err.response?.data?.contactSupport) {
                setContactSupport(true);
                setError(err.response.data.message);
            } else {
                setError(err.response?.data?.message || "An error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="d-flex align-items-center justify-content-center min-vh-100"
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '2rem 0'
            }}
        >
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                            <Card.Body className="p-5">
                                <div className="text-center mb-4">
                                    <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                        <i className="bi bi-key fs-1 text-primary"></i>
                                    </div>
                                    <h3 className="fw-bold">Forgot Password?</h3>
                                    <p className="text-muted">Enter your email to receive a reset link</p>
                                </div>

                                {success ? (
                                    <Alert variant="success" className="text-center">
                                        <i className="bi bi-check-circle me-2"></i>
                                        If an account with that email exists, a password reset link has been sent.
                                        <hr />
                                        <Link to="/login" className="btn btn-primary">
                                            Return to Login
                                        </Link>
                                    </Alert>
                                ) : contactSupport ? (
                                    <Alert variant="warning" className="text-center">
                                        <i className="bi bi-shield-exclamation me-2"></i>
                                        {error}
                                        <hr />
                                        <p className="mb-2">Please contact tech support to reset your password:</p>
                                        <a href="mailto:support@myuniclips.com" className="btn btn-outline-primary">
                                            <i className="bi bi-envelope me-2"></i>
                                            support@myuniclips.com
                                        </a>
                                    </Alert>
                                ) : (
                                    <>
                                        {error && (
                                            <Alert variant="danger" className="rounded-3">
                                                {error}
                                            </Alert>
                                        )}

                                        <Form onSubmit={handleSubmit}>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="fw-semibold">Email Address</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="py-3"
                                                />
                                            </Form.Group>

                                            <Button 
                                                type="submit" 
                                                disabled={loading}
                                                className="w-100 py-3 fw-semibold"
                                                variant="primary"
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    "Send Reset Link"
                                                )}
                                            </Button>
                                        </Form>
                                    </>
                                )}

                                <div className="text-center mt-4">
                                    <Link to="/login" className="text-decoration-none">
                                        <i className="bi bi-arrow-left me-1"></i>
                                        Back to Login
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default ForgotPassword;
