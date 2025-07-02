import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const NavigationBar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">
          📊 Candidate Tracker
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/candidate-form">
              {user.role === 'candidate' ? 'My Information' : 'Add Candidate'}
            </Nav.Link>
            {(user.role === 'admin' || user.role === 'lead') && (
              <>
                <Nav.Link as={Link} to="/candidates">
                  All Candidates
                </Nav.Link>
                <Nav.Link as={Link} to="/analytics">
                  Analytics
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            <Navbar.Text className="me-3">
              Welcome, {user.name} ({user.role})
            </Navbar.Text>
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
