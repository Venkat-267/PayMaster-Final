import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { Download, FileText, Calendar, DollarSign, Users, BarChart3 } from 'lucide-react';
import { toast } from 'react-toastify';
import reportsService from '../../services/reportsService';

const Reports = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [taxData, setTaxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payrollFilters, setPayrollFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    department: ''
  });
  const [taxFilters, setTaxFilters] = useState({
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchPayrollSummary();
  }, [payrollFilters]);

  useEffect(() => {
    fetchTaxStatements();
  }, [taxFilters]);

  const fetchPayrollSummary = async () => {
    try {
      setLoading(true);
      const result = await reportsService.getPayrollSummary(payrollFilters);
      
      if (result.success) {
        setPayrollData(result.data || []);
      } else {
        toast.error(result.message);
        setPayrollData([]);
      }
    } catch (error) {
      toast.error('Failed to fetch payroll summary');
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxStatements = async () => {
    try {
      setLoading(true);
      const result = await reportsService.getTaxStatements(taxFilters.year);
      
      if (result.success) {
        setTaxData(result.data || []);
      } else {
        toast.error(result.message);
        setTaxData([]);
      }
    } catch (error) {
      toast.error('Failed to fetch tax statements');
      setTaxData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayrollCSV = async () => {
    try {
      const result = await reportsService.downloadPayrollSummary(payrollFilters);
      if (result.success) {
        toast.success('Payroll summary downloaded successfully');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to download payroll summary');
    }
  };

  const handleDownloadPayrollPDF = async () => {
    try {
      const result = await reportsService.downloadPayrollSummaryPDF(payrollFilters);
      if (result.success) {
        toast.success('Payroll summary PDF downloaded successfully');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to download payroll summary PDF');
    }
  };

  const handleDownloadTimesheets = async () => {
    try {
      const filters = {
        from: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01T00:00:00Z`,
        to: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}T23:59:59Z`
      };
      
      const result = await reportsService.downloadTimesheets(filters);
      if (result.success) {
        toast.success('Timesheets downloaded successfully');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to download timesheets');
    }
  };

  const getPayrollSummary = () => {
    return {
      totalEmployees: payrollData.length,
      totalGrossPay: payrollData.reduce((sum, item) => sum + (item.GrossPay || 0), 0),
      totalNetPay: payrollData.reduce((sum, item) => sum + (item.NetPay || 0), 0),
      totalPF: payrollData.reduce((sum, item) => sum + (item.EmployeePF || 0), 0),
      totalTax: payrollData.reduce((sum, item) => sum + (item.IncomeTax || 0), 0)
    };
  };

  const getTaxSummary = () => {
    return {
      totalEmployees: taxData.length,
      totalPF: taxData.reduce((sum, item) => sum + (item.TotalEmployeePF || 0), 0),
      totalIncomeTax: taxData.reduce((sum, item) => sum + (item.TotalIncomeTax || 0), 0),
      totalTax: taxData.reduce((sum, item) => sum + (item.TotalTax || 0), 0)
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const payrollSummary = getPayrollSummary();
  const taxSummary = getTaxSummary();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reports</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={handleDownloadTimesheets}>
            <Download size={18} className="me-1" />
            Download Timesheets
          </Button>
        </div>
      </div>

      <Tabs defaultActiveKey="payroll" className="mb-4">
        <Tab eventKey="payroll" title="Payroll Summary">
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Payroll Filters</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Month</Form.Label>
                    <Form.Select
                      value={payrollFilters.month}
                      onChange={(e) => setPayrollFilters({...payrollFilters, month: e.target.value})}
                    >
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2025, i, 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Year</Form.Label>
                    <Form.Select
                      value={payrollFilters.year}
                      onChange={(e) => setPayrollFilters({...payrollFilters, year: e.target.value})}
                    >
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Control
                      type="text"
                      value={payrollFilters.department}
                      onChange={(e) => setPayrollFilters({...payrollFilters, department: e.target.value})}
                      placeholder="Enter department"
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <div className="d-flex gap-2">
                    <Button variant="success" onClick={handleDownloadPayrollCSV}>
                      <Download size={16} className="me-1" />
                      CSV
                    </Button>
                    <Button variant="danger" onClick={handleDownloadPayrollPDF}>
                      <Download size={16} className="me-1" />
                      PDF
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Payroll Summary Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <Users size={24} className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-1">Total Employees</h6>
                      <h3 className="mb-0">{payrollSummary.totalEmployees}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                      <DollarSign size={24} className="text-success" />
                    </div>
                    <div>
                      <h6 className="mb-1">Total Gross Pay</h6>
                      <h3 className="mb-0">{formatCurrency(payrollSummary.totalGrossPay)}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                      <DollarSign size={24} className="text-info" />
                    </div>
                    <div>
                      <h6 className="mb-1">Total Net Pay</h6>
                      <h3 className="mb-0">{formatCurrency(payrollSummary.totalNetPay)}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                      <DollarSign size={24} className="text-warning" />
                    </div>
                    <div>
                      <h6 className="mb-1">Total Deductions</h6>
                      <h3 className="mb-0">{formatCurrency(payrollSummary.totalPF + payrollSummary.totalTax)}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Payroll Details</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-2">Loading payroll data...</p>
                </div>
              ) : payrollData.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Month/Year</th>
                      <th>Gross Pay</th>
                      <th>Employee PF</th>
                      <th>Income Tax</th>
                      <th>Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div>
                            <strong>{item.EmployeeName}</strong>
                            <br />
                            <small className="text-muted">ID: {item.EmployeeId}</small>
                          </div>
                        </td>
                        <td>{item.Month}/{item.Year}</td>
                        <td>{formatCurrency(item.GrossPay || 0)}</td>
                        <td>{formatCurrency(item.EmployeePF || 0)}</td>
                        <td>{formatCurrency(item.IncomeTax || 0)}</td>
                        <td><strong>{formatCurrency(item.NetPay || 0)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-active">
                      <th colSpan="2">Total</th>
                      <th>{formatCurrency(payrollSummary.totalGrossPay)}</th>
                      <th>{formatCurrency(payrollSummary.totalPF)}</th>
                      <th>{formatCurrency(payrollSummary.totalTax)}</th>
                      <th>{formatCurrency(payrollSummary.totalNetPay)}</th>
                    </tr>
                  </tfoot>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <BarChart3 size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No Payroll Data Found</h5>
                  <p className="text-muted">No payroll records found for the selected filters.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="tax" title="Tax Statements">
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Tax Statement Filters</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Year</Form.Label>
                    <Form.Select
                      value={taxFilters.year}
                      onChange={(e) => setTaxFilters({...taxFilters, year: e.target.value})}
                    >
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Tax Summary Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <Users size={24} className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-1">Total Employees</h6>
                      <h3 className="mb-0">{taxSummary.totalEmployees}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                      <DollarSign size={24} className="text-success" />
                    </div>
                    <div>
                      <h6 className="mb-1">Total PF</h6>
                      <h3 className="mb-0">{formatCurrency(taxSummary.totalPF)}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                      <DollarSign size={24} className="text-danger" />
                    </div>
                    <div>
                      <h6 className="mb-1">Total Income Tax</h6>
                      <h3 className="mb-0">{formatCurrency(taxSummary.totalIncomeTax)}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                      <DollarSign size={24} className="text-info" />
                    </div>
                    <div>
                      <h6 className="mb-1">Total Tax</h6>
                      <h3 className="mb-0">{formatCurrency(taxSummary.totalTax)}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Tax Statement Details</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-2">Loading tax data...</p>
                </div>
              ) : taxData.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Total Employee PF</th>
                      <th>Total Income Tax</th>
                      <th>Total Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxData.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div>
                            <strong>{item.EmployeeName}</strong>
                            <br />
                            <small className="text-muted">ID: {item.EmployeeId}</small>
                          </div>
                        </td>
                        <td>{formatCurrency(item.TotalEmployeePF || 0)}</td>
                        <td>{formatCurrency(item.TotalIncomeTax || 0)}</td>
                        <td><strong>{formatCurrency(item.TotalTax || 0)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-active">
                      <th>Total</th>
                      <th>{formatCurrency(taxSummary.totalPF)}</th>
                      <th>{formatCurrency(taxSummary.totalIncomeTax)}</th>
                      <th>{formatCurrency(taxSummary.totalTax)}</th>
                    </tr>
                  </tfoot>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <FileText size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No Tax Data Found</h5>
                  <p className="text-muted">No tax statements found for the selected year.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Reports;