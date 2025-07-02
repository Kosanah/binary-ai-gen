import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const CandidateForm = ({ user }) => {
  const [formData, setFormData] = useState({
    candidateName: '',
    date: new Date(),
    morningApplications: '',
    submissions: '',
    screenings: '',
    interviews: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [candidateNames, setCandidateNames] = useState([
    'Murali', 'Anil Varma', 'Pavan Kumar', 'Akshith', 'Sathya', 
    'Indhira', 'Roja', 'Sathvika', 'Pravallika', 'Edara Chandra Shekar', 
    'Mani Kanta', 'Vardan', 'Poojitha', 'Tejaswi', 'Swarna', 
    'Amulya', 'Amrutha', 'Priyanka', 'Krishna'
  ]);
  const [newCandidateName, setNewCandidateName] = useState('');

  useEffect(() => {
    // If user is a candidate, load their existing data
    if (user.role === 'candidate') {
      loadCandidateData();
    }
  }, [user]);

  const loadCandidateData = () => {
    try {
      const candidates = JSON.parse(localStorage.getItem('candidates') || '[]');
      const userData = candidates.find(c => c.userId === user.id);
      
      if (userData) {
        setFormData({
          candidateName: userData.candidateName,
          date: new Date(userData.date),
          morningApplications: userData.morningApplications || '',
          submissions: userData.submissions || '',
          screenings: userData.screenings || '',
          interviews: userData.interviews || '',
          notes: userData.notes || ''
        });
        setEditing(true);
        setEditId(userData.id);
      } else {
        // Set default name for candidate
        setFormData(prev => ({
          ...prev,
          candidateName: user.name
        }));
      }
    } catch (error) {
      console.error('Error loading candidate data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const candidates = JSON.parse(localStorage.getItem('candidates') || '[]');
      
      const candidateData = {
        id: editing ? editId : Date.now().toString(),
        userId: user.role === 'candidate' ? user.id : null,
        candidateName: formData.candidateName,
        date: formData.date.toISOString(),
        morningApplications: formData.morningApplications === 'yes' ? 'yes' : 'no',
        submissions: parseInt(formData.submissions) || 0,
        screenings: parseInt(formData.screenings) || 0,
        interviews: parseInt(formData.interviews) || 0,
        notes: formData.notes,
        createdAt: editing ? candidates.find(c => c.id === editId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editing) {
        // Update existing entry
        const index = candidates.findIndex(c => c.id === editId);
        if (index !== -1) {
          candidates[index] = candidateData;
        }
      } else {
        // Add new entry
        candidates.push(candidateData);
      }

      localStorage.setItem('candidates', JSON.stringify(candidates));
      
      toast.success(editing ? 'Information updated successfully!' : 'Information added successfully!');
      
      if (user.role === 'candidate') {
        setEditing(true);
        setEditId(candidateData.id);
      } else {
        // Reset form for admin/lead
        setFormData({
          candidateName: '',
          date: new Date(),
          morningApplications: '',
          submissions: '',
          screenings: '',
          interviews: '',
          notes: ''
        });
      }
    } catch (error) {
      toast.error('Failed to save information!');
      console.error('Error saving candidate data:', error);
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

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date: date
    });
  };

  const handleAddCandidateName = () => {
    if (newCandidateName && !candidateNames.includes(newCandidateName)) {
      setCandidateNames([...candidateNames, newCandidateName]);
      setFormData({ ...formData, candidateName: newCandidateName });
      setNewCandidateName('');
      toast.success('New candidate name added!');
    } else {
      toast.error('Name is empty or already exists!');
    }
  };

  return (
    <div>
      <h1 className="mb-4">
        {user.role === 'candidate' ? '📝 My Information' : '➕ Add Candidate Information'}
      </h1>
      
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Candidate Name</Form.Label>
                      {user.role === 'candidate' ? (
                        <Form.Control
                          type="text"
                          value={formData.candidateName}
                          disabled
                        />
                      ) : (
                        <>
                          <Form.Select
                            name="candidateName"
                            value={formData.candidateName}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Candidate</option>
                            {candidateNames.map((name, index) => (
                              <option key={index} value={name}>{name}</option>
                            ))}
                          </Form.Select>
                          <div className="d-flex mt-2">
                            <Form.Control
                              type="text"
                              placeholder="Add new candidate name"
                              value={newCandidateName}
                              onChange={e => setNewCandidateName(e.target.value)}
                            />
                            <Button
                              variant="outline-primary"
                              type="button"
                              className="ms-2"
                              onClick={handleAddCandidateName}
                            >
                              Add
                            </Button>
                          </div>
                        </>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <DatePicker
                        selected={formData.date}
                        onChange={handleDateChange}
                        className="form-control"
                        dateFormat="MM/dd/yyyy"
                        maxDate={new Date()}
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
                        value={formData.morningApplications}
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
                        value={formData.submissions}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Screenings</Form.Label>
                      <Form.Control
                        type="number"
                        name="screenings"
                        value={formData.screenings}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Interviews</Form.Label>
                      <Form.Control
                        type="number"
                        name="interviews"
                        value={formData.interviews}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any additional notes..."
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editing ? 'Update Information' : 'Save Information')}
                  </Button>
                  {user.role !== 'candidate' && (
                    <Button 
                      variant="outline-secondary" 
                      type="button"
                      onClick={() => {
                        setFormData({
                          candidateName: '',
                          date: new Date(),
                          morningApplications: '',
                          submissions: '',
                          screenings: '',
                          interviews: '',
                          notes: ''
                        });
                        setEditing(false);
                        setEditId(null);
                      }}
                    >
                      Clear Form
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CandidateForm;
