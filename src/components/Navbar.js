import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// Add default admin to localStorage if not present
const ensureDefaultAdmin = () => {
  if (typeof window === 'undefined') return;
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem('users') || '[]');
  } catch {
    users = [];
  }
  // Update admin email to admin@gmail.com
  const adminExists = users.some(u => u.email === 'admin@gmail.com' && u.role === 'admin');
  if (!adminExists) {
    users.push({
      id: '1',
      name: 'Hari',
      email: 'admin@gmail.com',
      password: 'Hari@9652',
      role: 'admin'
    });
    localStorage.setItem('users', JSON.stringify(users));
  }
};

const Register = ({ onRegister }) => {
  useEffect(() => {
    ensureDefaultAdmin();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      setLoading(false);
      return;
    }

    try {
      let users = [];
      try {
        users = JSON.parse(localStorage.getItem('users') || '[]');
      } catch {
        users = [];
      }
      // Check if user already exists
      const existingUser = users.find(u => u.email === formData.email);
      if (existingUser) {
        toast.error('User with this email already exists!');
        setLoading(false);
        return;
      }

      // Create new user with default role (pending)
      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'pending' // Default role, to be set by admin
      };

      // Save to localStorage
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Auto login
      onRegister({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      });

      toast.success('Registration successful!');
    } catch (error) {
      toast.error('Registration failed!');
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
              <h2>📝 Register</h2>
            </Card.Title>
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </Form.Group>

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
                  minLength={6}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  minLength={6}
                />
              </Form.Group>

              {/* Role selection removed. Admin will assign roles. */}

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 mb-3"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </Form>

            <div className="text-center">
              <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Register; 
