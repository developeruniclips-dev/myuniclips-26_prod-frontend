// src/pages/login/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Button, Form, Card, Container, Row, Col, Alert } from "react-bootstrap";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [contactSupport, setContactSupport] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setError("Invalid reset link. Please request a new password reset.");
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/password/reset`,
                { token, email, newPassword }
            );

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
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
                                        <i className="bi bi-shield-lock fs-1 text-primary"></i>
                                    </div>
                                    <h3 className="fw-bold">Reset Password</h3>
                                    <p className="text-muted">Enter your new password</p>
                                </div>

                                {success ? (
                                    <Alert variant="success" className="text-center">
                                        <i className="bi bi-check-circle me-2"></i>
                                        Password reset successfully!
                                        <hr />
                                        <p className="mb-0">Redirecting to login...</p>
                                    </Alert>
                                ) : contactSupport ? (
                                    <Alert variant="warning" className="text-center">
                                        <i className="bi bi-shield-exclamation me-2"></i>
                                        {error}
                                        <hr />
                                        <p className="mb-2">Please contact tech support:</p>
                                        <a href="mailto:support@myuniclips.com" className="btn btn-outline-primary">
                                            <i className="bi bi-envelope me-2"></i>
                                            support@myuniclips.com
                                        </a>
                                    </Alert>
                                ) : !token || !email ? (
                                    <Alert variant="danger" className="text-center">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        Invalid reset link
                                        <hr />
                                        <Link to="/forgot-password" className="btn btn-primary">
                                            Request New Reset Link
                                        </Link>
                                    </Alert>
                                ) : (
                                    <>
                                        {error && (
                                            <Alert variant="danger" className="rounded-3">
                                                {error}
                                            </Alert>
                                        )}

                                        <Form onSubmit={handleSubmit}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold">New Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Enter new password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                    minLength={6}
                                                    className="py-3"
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    minLength={6}
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
                                                        Resetting...
                                                    </>
                                                ) : (
                                                    "Reset Password"
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

export default ResetPassword;
