import React, { useState, useEffect } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

function ScholarNavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className={`px-4 transition-navbar ${
        scrolled ? "bg-dark navbar-dark shadow-sm" : "bg-transparent"
      }`}
    >
      <Container fluid>
        <Navbar.Brand
          as={Link}
          to="/"
          className={`fw-bold fs-4 text-decoration-none ${
            scrolled ? "text-white" : "text-dark"
          }`}
        >
          UNICLIPS
        </Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/">
            Home
          </Nav.Link>
          <Nav.Link as={Link} to='scholar'>Join Scholar</Nav.Link>
          <Nav.Link as={Link} to='teacher'>Scholar</Nav.Link>
          <Nav.Link as={Link} to='aboutUs'>About Us</Nav.Link>
          <Nav.Link as={Link} to='dashboard' className={`${scrolled ? "text-white" : "text-dark"}`}>
            <i className="bi bi-speedometer2 fs-5"></i> {/* Speedometer icon */}
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default ScholarNavBar;
