// src/pages/login/LoginPage.jsx
import React, { useState } from "react";
import { Button, Form, Card, Container, Row, Col, Alert } from "react-bootstrap";
import { useAuth } from "../../context/temp";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const result = await login(email, password);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    const roles = result.user?.roles || [];

    // Admins go to admin dashboard
    if (roles.includes("Admin"))
      return navigate("/admin-dashboard");

    // Scholars always go to scholar dashboard, even if they have Learner role
    if (roles.includes("Scholar"))
      return navigate("/scholar-dashboard");

    // Regular learners go to learner dashboard
    if (roles.includes("Learner"))
      return navigate("/dashboard");

    return navigate("/");
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
          <Col md={10} lg={8} xl={6}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <Row className="g-0">
                <Col md={6} className="d-none d-md-block position-relative">
                  <div 
                    className="h-100 d-flex flex-column justify-content-center align-items-center text-white p-5"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                    }}
                  >
                    <h2 className="fw-bold mb-3">Welcome Back!</h2>
                    <p className="text-center opacity-90">
                      Sign in to continue your learning journey
                    </p>
                    <div className="mt-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                          📚
                        </div>
                        <span>Access your courses</span>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                          🎓
                        </div>
                        <span>Track your progress</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-white bg-opacity-25 p-3 me-3">
                          ⭐
                        </div>
                        <span>Learn from experts</span>
                      </div>
                    </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <Card.Body className="p-5">
                    <div className="text-center mb-4">
                      <h3 className="fw-bold gradient-text">Sign In</h3>
                      <p className="text-muted">Enter your credentials to access your account</p>
                    </div>

                    {error && (
                      <Alert variant="danger" className="rounded-3">
                        {error}
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit} autoComplete="off">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Email / Username</Form.Label>
                        <Form.Control
                          type="text"
                          name="login_email_field"
                          autoComplete="new-password"
                          placeholder="Enter your email or username"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="py-3"
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Password</Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="login_password_field"
                            autoComplete="new-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="py-3 pe-5"
                          />
                          <span
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ 
                              position: 'absolute',
                              right: '15px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              cursor: 'pointer',
                              color: '#6c757d'
                            }}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} fs-5`}></i>
                          </span>
                        </div>
                      </Form.Group>

                      <div className="d-flex justify-content-end mb-3">
                        <Link 
                          to="/forgot-password" 
                          className="text-decoration-none small"
                          style={{ color: 'var(--primary-color)' }}
                        >
                          Forgot Password?
                        </Link>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-100 py-3 fw-semibold"
                        variant="primary"
                      >
                        {loading ? "Signing in..." : "Sign In"}
                      </Button>
                    </Form>

                    <div className="text-center mt-4">
                      <p className="text-muted mb-0">
                        Don't have an account?{" "}
                        <Link 
                          to="/register" 
                          className="text-decoration-none fw-semibold"
                          style={{ color: 'var(--primary-color)' }}
                        >
                          Create Account
                        </Link>
                      </p>
                    </div>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LoginPage;
