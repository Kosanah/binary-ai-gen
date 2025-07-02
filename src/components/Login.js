import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => 
        u.email === formData.email && 
        u.password === formData.password
      );

      if (user) {
        onLogin({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });
        toast.success('Login successful!');
      } else {
        toast.error('Invalid credentials!');
      }
    } catch (error) {
      toast.error('Login failed!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Row className="justify-content-center">
      <Col md={6} lg={4}>
        <Card className="mt-5">
          <Card.Body>
            <Card.Title className="text-center mb-4">
              <h2>🔐 Login</h2>
            </Card.Title>
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 mb-3"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form>

            <div className="text-center">
              <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Login; 
