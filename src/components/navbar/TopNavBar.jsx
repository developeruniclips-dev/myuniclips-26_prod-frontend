// src/components/navbar/TopNavBar.jsx
import React, { useState, useEffect } from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/temp";

function TopNavBar({ showLinks = true }) {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-close mobile nav when route changes
  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);

  // Close nav when clicking a link
  const handleNavClick = () => {
    setExpanded(false);
  };

  return (
    <Navbar
      expand="lg"
      fixed="top"
      expanded={expanded}
      onToggle={(isExpanded) => setExpanded(isExpanded)}
      className={`px-4 py-3 transition-navbar ${
        scrolled ? "scrolled navbar-dark" : "navbar-light"
      }`}
      style={!scrolled ? { background: 'rgba(99, 102, 241, 0.95)' } : { background: 'rgba(30, 41, 59, 0.95)' }}
    >
      <Container fluid>
        <Navbar.Brand
          as={Link}
          to="/"
          className="fw-bold fs-3 text-white"
          style={{ letterSpacing: '1px' }}
        >
          🎓 UNICLIPS
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" className="border-0 text-white" />
        
        <Navbar.Collapse id="navbar-nav">
          {showLinks && (
            <Nav className="ms-auto align-items-center gap-1">
              <Nav.Link 
                as={Link} 
                to="/" 
                className="px-3 fw-semibold text-white"
                style={{ transition: 'all 0.3s' }}
                onClick={handleNavClick}
              >
                Home
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/all-videos"
                className="px-3 fw-semibold text-white"
                onClick={handleNavClick}
              >
                Courses
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/become-scholar"
                className="px-3 fw-semibold text-white"
                onClick={handleNavClick}
              >
                Scholar
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/aboutUs"
                className="px-3 fw-semibold text-white"
                onClick={handleNavClick}
              >
                About Us
              </Nav.Link>

              {/* Show dashboard link for any logged in user when NOT already on a dashboard page */}
              {user && !location.pathname.includes("dashboard") && !location.pathname.includes("upload-video") && !location.pathname.includes("create-course") && (
                <Nav.Link 
                  as={Link} 
                  to={user?.roles?.includes("SuperAdmin") ? "/superadmin-dashboard" : user?.roles?.includes("Admin") ? "/admin-dashboard" : user?.roles?.includes("Scholar") ? "/scholar-dashboard" : "/dashboard"}
                  className="px-3 fw-semibold text-white"
                  onClick={handleNavClick}
                >
                  📚 Dashboard
                </Nav.Link>
              )}

              {/* Show Login button only when user is NOT logged in */}
              {!user && (
                <Button
                  as={Link}
                  to="/login"
                  variant="light"
                  className="ms-3 px-4 fw-semibold"
                  style={{ borderRadius: '25px' }}
                  onClick={handleNavClick}
                >
                  Login
                </Button>
              )}

              {/* Show Logout button when user IS logged in */}
              {user && (
                <Button
                  variant="outline-light"
                  className="ms-3 px-4 fw-semibold"
                  style={{ borderRadius: '25px' }}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      logout();
                      navigate('/');
                    }
                  }}
                >
                  Logout
                </Button>
              )}
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default TopNavBar;

