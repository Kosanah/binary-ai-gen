import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalApplications: 0,
    totalSubmissions: 0,
    totalScreenings: 0,
    totalInterviews: 0
  });
  const [recentEntries, setRecentEntries] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    try {
      const candidates = JSON.parse(localStorage.getItem('candidates') || '[]');
      
      // Calculate totals
      const totals = candidates.reduce((acc, candidate) => {
        acc.totalApplications += candidate.morningApplications || 0;
        acc.totalSubmissions += candidate.submissions || 0;
        acc.totalScreenings += candidate.screenings || 0;
        acc.totalInterviews += candidate.interviews || 0;
        return acc;
      }, {
        totalApplications: 0,
        totalSubmissions: 0,
        totalScreenings: 0,
        totalInterviews: 0
      });

      setStats({
        totalCandidates: candidates.length,
        ...totals
      });

      // Get recent entries (last 5)
      const recent = candidates
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setRecentEntries(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getRoleBasedContent = () => {
    switch (user.role) {
      case 'admin':
        return (
          <>
            <Row className="mb-4">
              <Col md={12}>
                <Card>
                  <Card.Body>
                    <Card.Title>👑 Admin Dashboard</Card.Title>
                    <Card.Text>
                      You have full access to manage all candidates, view analytics, and generate reports.
                    </Card.Text>
                    <div className="d-flex gap-2">
                      <Button as={Link} to="/candidate-form" variant="primary">
                        Add New Candidate
                      </Button>
                      <Button as={Link} to="/candidates" variant="outline-primary">
                        View All Candidates
                      </Button>
                      <Button as={Link} to="/analytics" variant="outline-primary">
                        View Analytics
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        );
      
      case 'lead':
        return (
          <>
            <Row className="mb-4">
              <Col md={12}>
                <Card>
                  <Card.Body>
                    <Card.Title>👥 Lead Dashboard</Card.Title>
                    <Card.Text>
                      You can manage candidates, view their progress, and access analytics.
                    </Card.Text>
                    <div className="d-flex gap-2">
                      <Button as={Link} to="/candidate-form" variant="primary">
                        Add New Candidate
                      </Button>
                      <Button as={Link} to="/candidates" variant="outline-primary">
                        View All Candidates
                      </Button>
                      <Button as={Link} to="/analytics" variant="outline-primary">
                        View Analytics
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        );
      
      case 'candidate':
        return (
          <>
            <Row className="mb-4">
              <Col md={12}>
                <Card>
                  <Card.Body>
                    <Card.Title>👤 Candidate Dashboard</Card.Title>
                    <Card.Text>
                      Update your progress information and track your applications.
                    </Card.Text>
                    <Button as={Link} to="/candidate-form" variant="primary">
                      Update My Information
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="mb-4">📊 Dashboard</h1>
      
      {getRoleBasedContent()}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={2}>
          <div className="stats-card">
            <div className="stats-number">{stats.totalCandidates}</div>
            <div className="stats-label">Total Candidates</div>
          </div>
        </Col>
        <Col md={2}>
          <div className="stats-card">
            <div className="stats-number">{stats.totalApplications}</div>
            <div className="stats-label">Morning Applications</div>
          </div>
        </Col>
        <Col md={2}>
          <div className="stats-card">
            <div className="stats-number">{stats.totalSubmissions}</div>
            <div className="stats-label">Submissions</div>
          </div>
        </Col>
        <Col md={2}>
          <div className="stats-card">
            <div className="stats-number">{stats.totalScreenings}</div>
            <div className="stats-label">Screenings</div>
          </div>
        </Col>
        <Col md={2}>
          <div className="stats-card">
            <div className="stats-number">{stats.totalInterviews}</div>
            <div className="stats-label">Interviews</div>
          </div>
        </Col>
        <Col md={2}>
          <div className="stats-card">
            <div className="stats-number">
              {stats.totalCandidates > 0 ? 
                Math.round((stats.totalInterviews / stats.totalCandidates) * 100) : 0}%
            </div>
            <div className="stats-label">Interview Rate</div>
          </div>
        </Col>
      </Row>

      {/* Recent Entries */}
      {(user.role === 'admin' || user.role === 'lead') && (
        <Row>
          <Col md={12}>
            <Card>
              <Card.Body>
                <Card.Title>📅 Recent Entries</Card.Title>
                {recentEntries.length > 0 ? (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Candidate Name</th>
                        <th>Morning Applications</th>
                        <th>Submissions</th>
                        <th>Screenings</th>
                        <th>Interviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEntries.map((entry, index) => (
                        <tr key={index}>
                          <td>{new Date(entry.date).toLocaleDateString()}</td>
                          <td>{entry.candidateName}</td>
                          <td>{entry.morningApplications || 0}</td>
                          <td>{entry.submissions || 0}</td>
                          <td>{entry.screenings || 0}</td>
                          <td>{entry.interviews || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-muted">No recent entries found.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dashboard; 