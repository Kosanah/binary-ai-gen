import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Nav, Tab } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

const Analytics = ({ user }) => {
  const [candidates, setCandidates] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [candidateStats, setCandidateStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    try {
      const data = JSON.parse(localStorage.getItem('candidates') || '[]');
      setCandidates(data);
      
      // Prepare chart data
      const chartData = data.reduce((acc, candidate) => {
        const existing = acc.find(item => item.candidateName === candidate.candidateName);
        if (existing) {
          existing.morningApplications += candidate.morningApplications || 0;
          existing.submissions += candidate.submissions || 0;
          existing.screenings += candidate.screenings || 0;
          existing.interviews += candidate.interviews || 0;
        } else {
          acc.push({
            candidateName: candidate.candidateName,
            morningApplications: candidate.morningApplications || 0,
            submissions: candidate.submissions || 0,
            screenings: candidate.screenings || 0,
            interviews: candidate.interviews || 0
          });
        }
        return acc;
      }, []);

      setChartData(chartData);

      // Calculate individual candidate statistics
      const stats = chartData.map(candidate => ({
        ...candidate,
        totalActivity: candidate.morningApplications + candidate.submissions + candidate.screenings + candidate.interviews,
        successRate: candidate.totalActivity > 0 ? Math.round((candidate.interviews / candidate.totalActivity) * 100) : 0
      }));

      setCandidateStats(stats.sort((a, b) => b.totalActivity - a.totalActivity));
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const exportToExcel = (type = 'all') => {
    setLoading(true);
    
    try {
      let dataToExport = [];
      let fileName = '';

      if (type === 'all') {
        dataToExport = candidates.map(c => ({
          Date: new Date(c.date).toLocaleDateString(),
          'Candidate Name': c.candidateName,
          'Morning Applications': c.morningApplications || 0,
          'Submissions': c.submissions || 0,
          'Screenings': c.screenings || 0,
          'Interviews': c.interviews || 0,
          'Notes': c.notes || '',
          'Created At': new Date(c.createdAt).toLocaleDateString(),
          'Updated At': new Date(c.updatedAt).toLocaleDateString()
        }));
        fileName = 'all_candidates_data.xlsx';
      } else if (type === 'summary') {
        dataToExport = candidateStats.map(c => ({
          'Candidate Name': c.candidateName,
          'Morning Applications': c.morningApplications,
          'Submissions': c.submissions,
          'Screenings': c.screenings,
          'Interviews': c.interviews,
          'Total Activity': c.totalActivity,
          'Success Rate (%)': c.successRate
        }));
        fileName = 'candidate_summary.xlsx';
      } else if (type === 'individual') {
        // Export individual candidate data
        const candidateNames = [...new Set(candidates.map(c => c.candidateName))];
        candidateNames.forEach(name => {
          const candidateData = candidates.filter(c => c.candidateName === name);
          const individualData = candidateData.map(c => ({
            Date: new Date(c.date).toLocaleDateString(),
            'Morning Applications': c.morningApplications || 0,
            'Submissions': c.submissions || 0,
            'Screenings': c.screenings || 0,
            'Interviews': c.interviews || 0,
            'Notes': c.notes || ''
          }));
          
          const ws = XLSX.utils.json_to_sheet(individualData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, name);
          
          if (name === candidateNames[0]) {
            XLSX.writeFile(wb, `${name}_progress.xlsx`);
          }
        });
        setLoading(false);
        toast.success('Individual files exported successfully!');
        return;
      }

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(dataBlob, fileName);
      
      toast.success('Excel file exported successfully!');
    } catch (error) {
      toast.error('Failed to export Excel file!');
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallStats = () => {
    const totals = candidates.reduce((acc, candidate) => {
      acc.morningApplications += candidate.morningApplications || 0;
      acc.submissions += candidate.submissions || 0;
      acc.screenings += candidate.screenings || 0;
      acc.interviews += candidate.interviews || 0;
      return acc;
    }, {
      morningApplications: 0,
      submissions: 0,
      screenings: 0,
      interviews: 0
    });

    return totals;
  };

  const overallStats = getOverallStats();

  return (
    <div>
      <h1 className="mb-4">📈 Analytics & Reports</h1>

      {/* Export Buttons */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>📊 Export Reports</Card.Title>
          <div className="d-flex gap-2 flex-wrap">
            <Button 
              variant="success" 
              onClick={() => exportToExcel('all')}
              disabled={loading}
            >
              {loading ? 'Exporting...' : '📋 Export All Data'}
            </Button>
            <Button 
              variant="info" 
              onClick={() => exportToExcel('summary')}
              disabled={loading}
            >
              {loading ? 'Exporting...' : '📊 Export Summary'}
            </Button>
            <Button 
              variant="warning" 
              onClick={() => exportToExcel('individual')}
              disabled={loading}
            >
              {loading ? 'Exporting...' : '👤 Export Individual Files'}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Overall Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <div className="stats-card">
            <div className="stats-number">{overallStats.morningApplications}</div>
            <div className="stats-label">Total Morning Applications</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stats-card">
            <div className="stats-number">{overallStats.submissions}</div>
            <div className="stats-label">Total Submissions</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stats-card">
            <div className="stats-number">{overallStats.screenings}</div>
            <div className="stats-label">Total Screenings</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stats-card">
            <div className="stats-number">{overallStats.interviews}</div>
            <div className="stats-label">Total Interviews</div>
          </div>
        </Col>
      </Row>

      {/* Charts and Tables */}
      <Tab.Container id="analytics-tabs" defaultActiveKey="charts">
        <Card>
          <Card.Body>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="charts">📊 Charts</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="tables">📋 Tables</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="charts">
                <Row>
                  <Col md={6}>
                    <div className="chart-container">
                      <h5>Candidate Performance Overview</h5>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="candidateName" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="morningApplications" fill="#0088FE" name="Applications" />
                          <Bar dataKey="submissions" fill="#00C49F" name="Submissions" />
                          <Bar dataKey="screenings" fill="#FFBB28" name="Screenings" />
                          <Bar dataKey="interviews" fill="#FF8042" name="Interviews" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="chart-container">
                      <h5>Interview Success Rate</h5>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Interviews', value: overallStats.interviews },
                              { name: 'Screenings', value: overallStats.screenings },
                              { name: 'Submissions', value: overallStats.submissions },
                              { name: 'Applications', value: overallStats.morningApplications }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {COLORS.map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <div className="chart-container">
                      <h5>Progress Timeline</h5>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={candidates.slice(0, 20).map(c => ({
                          date: new Date(c.date).toLocaleDateString(),
                          interviews: c.interviews || 0,
                          screenings: c.screenings || 0
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="interviews" stroke="#FF8042" name="Interviews" />
                          <Line type="monotone" dataKey="screenings" stroke="#FFBB28" name="Screenings" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Col>
                </Row>
              </Tab.Pane>

              <Tab.Pane eventKey="tables">
                <Row>
                  <Col md={12}>
                    <div className="chart-container">
                      <h5>Candidate Performance Summary</h5>
                      <Table responsive striped>
                        <thead>
                          <tr>
                            <th>Candidate Name</th>
                            <th>Morning Applications</th>
                            <th>Submissions</th>
                            <th>Screenings</th>
                            <th>Interviews</th>
                            <th>Total Activity</th>
                            <th>Success Rate (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {candidateStats.map((candidate, index) => (
                            <tr key={index}>
                              <td><strong>{candidate.candidateName}</strong></td>
                              <td>{candidate.morningApplications}</td>
                              <td>{candidate.submissions}</td>
                              <td>{candidate.screenings}</td>
                              <td>{candidate.interviews}</td>
                              <td>{candidate.totalActivity}</td>
                              <td>
                                <span className={`badge ${candidate.successRate > 50 ? 'bg-success' : candidate.successRate > 25 ? 'bg-warning' : 'bg-danger'}`}>
                                  {candidate.successRate}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Col>
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </div>
  );
};

export default Analytics; 
