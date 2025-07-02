import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, Modal, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CandidateList = ({ user }) => {
  const [candidates, setCandidates] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = () => {
    try {
      const data = JSON.parse(localStorage.getItem('candidates') || '[]');
      setCandidates(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const handleEdit = (candidate) => {
    setEditingCandidate({
      ...candidate,
      date: new Date(candidate.date)
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const updatedCandidates = candidates.filter(c => c.id !== id);
        localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
        setCandidates(updatedCandidates);
        toast.success('Entry deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete entry!');
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedData = {
        ...editingCandidate,
        morningApplications: editingCandidate.morningApplications === 'yes' ? 'yes' : 'no',
        submissions: parseInt(editingCandidate.submissions) || 0,
        screenings: parseInt(editingCandidate.screenings) || 0,
        interviews: parseInt(editingCandidate.interviews) || 0,
        updatedAt: new Date().toISOString()
      };

      const updatedCandidates = candidates.map(c => 
        c.id === editingCandidate.id ? updatedData : c
      );

      localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
      setCandidates(updatedCandidates);
      setShowEditModal(false);
      setEditingCandidate(null);
      toast.success('Information updated successfully!');
    } catch (error) {
      toast.error('Failed to update information!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEditingCandidate({
      ...editingCandidate,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (date) => {
    setEditingCandidate({
      ...editingCandidate,
      date: date
    });
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.candidateName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || new Date(candidate.date).toDateString() === filterDate.toDateString();
    return matchesSearch && matchesDate;
  });

  const getStatusBadge = (candidate) => {
    if (candidate.morningApplications === 'yes') return <Badge bg="success">Yes</Badge>;
    if (candidate.morningApplications === 'no') return <Badge bg="danger">No</Badge>;
    return <Badge bg="secondary">-</Badge>;
  };

  return (
    <div>
      <h1 className="mb-4">👥 All Candidates</h1>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Search by Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Date</Form.Label>
                <DatePicker
                  selected={filterDate}
                  onChange={setFilterDate}
                  className="form-control"
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select date to filter"
                  isClearable
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Candidates Table */}
      <Card>
        <Card.Body>
          <Card.Title>Candidate Information</Card.Title>
          {filteredCandidates.length > 0 ? (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Candidate Name</th>
                  <th>Morning Applications</th>
                  <th>Submissions</th>
                  <th>Screenings</th>
                  <th>Interviews</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{new Date(candidate.date).toLocaleDateString()}</td>
                    <td>
                      <strong>{candidate.candidateName}</strong>
                      {candidate.userId && <small className="text-muted d-block">Self-reported</small>}
                    </td>
                    <td>{candidate.morningApplications === 'yes' ? 'Yes' : candidate.morningApplications === 'no' ? 'No' : '-'}</td>
                    <td>{candidate.submissions || 0}</td>
                    <td>{candidate.screenings || 0}</td>
                    <td>{candidate.interviews || 0}</td>
                    <td>{getStatusBadge(candidate)}</td>
                    <td>
                      {candidate.notes ? (
                        <span title={candidate.notes}>
                          {candidate.notes.length > 30 ? 
                            candidate.notes.substring(0, 30) + '...' : 
                            candidate.notes
                          }
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {user.role === 'admin' && (
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEdit(candidate)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(candidate.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted text-center py-4">
              {searchTerm || filterDate ? 'No candidates found matching your filters.' : 'No candidate data available.'}
            </p>
          )}
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Candidate Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingCandidate && (
            <Form onSubmit={handleUpdate}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Candidate Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="candidateName"
                      value={editingCandidate.candidateName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <DatePicker
                      selected={editingCandidate.date}
                      onChange={handleDateChange}
                      className="form-control"
                      dateFormat="MM/dd/yyyy"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Morning Applications</Form.Label>
                    <Form.Select
                      name="morningApplications"
                      value={editingCandidate.morningApplications}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Submissions</Form.Label>
                    <Form.Control
                      type="number"
                      name="submissions"
                      value={editingCandidate.submissions}
                      onChange={handleChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Screenings</Form.Label>
                    <Form.Control
                      type="number"
                      name="screenings"
                      value={editingCandidate.screenings}
                      onChange={handleChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Interviews</Form.Label>
                    <Form.Control
                      type="number"
                      name="interviews"
                      value={editingCandidate.interviews}
                      onChange={handleChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={editingCandidate.notes || ''}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Information'}
                </Button>
                <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CandidateList;
