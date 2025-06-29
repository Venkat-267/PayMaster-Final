import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { Gift, DollarSign, Calendar, FileText, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import benefitService from '../../services/benefitService';

const Benefits = () => {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getCurrentUser } = useAuth();
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser?.id) {
      fetchMyBenefits();
    }
  }, [currentUser]);

  const fetchMyBenefits = async () => {
    try {
      setLoading(true);
      // Note: You'll need to get the employee ID from the current user
      // This might require an additional API call to get employee details by user ID
      const result = await benefitService.getEmployeeBenefits(currentUser.id);
      
      if (result.success) {
        setBenefits(result.data || []);
      } else {
        toast.error(result.message);
        setBenefits([]);
      }
    } catch (error) {
      toast.error('Failed to fetch benefits');
      setBenefits([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getBenefitTypeColor = (type) => {
    const colorMap = {
      'Health Insurance': 'success',
      'Dental Insurance': 'info',
      'Vision Insurance': 'primary',
      'Life Insurance': 'warning',
      'Retirement Plan': 'dark',
      'Transportation Allowance': 'secondary',
      'Meal Allowance': 'success',
      'Phone Allowance': 'info',
      'Internet Allowance': 'primary',
      'Gym Membership': 'warning',
      'Professional Development': 'dark',
      'Flexible Spending Account': 'secondary',
      'Childcare Assistance': 'success',
      'Education Assistance': 'info',
      'Other': 'light'
    };
    return colorMap[type] || 'secondary';
  };

  const getTotalBenefitValue = () => {
    return benefits.reduce((total, benefit) => total + (benefit.Amount || 0), 0);
  };

  const getAnnualBenefitValue = () => {
    // Assuming benefits are monthly, multiply by 12 for annual value
    return getTotalBenefitValue() * 12;
  };

  const getBenefitsByCategory = () => {
    const categories = {
      'Insurance': ['Health Insurance', 'Dental Insurance', 'Vision Insurance', 'Life Insurance'],
      'Allowances': ['Transportation Allowance', 'Meal Allowance', 'Phone Allowance', 'Internet Allowance'],
      'Wellness': ['Gym Membership', 'Childcare Assistance'],
      'Development': ['Professional Development', 'Education Assistance'],
      'Financial': ['Retirement Plan', 'Flexible Spending Account'],
      'Other': ['Other']
    };

    const categorized = {};
    Object.keys(categories).forEach(category => {
      categorized[category] = benefits.filter(benefit => 
        categories[category].includes(benefit.BenefitType)
      );
    });

    return categorized;
  };

  const categorizedBenefits = getBenefitsByCategory();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>My Benefits</h2>
          <p className="text-muted mb-0">View your employee benefits and compensation package</p>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <Gift size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Total Benefits</h6>
                  <h3 className="mb-0">{benefits.length}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                  <DollarSign size={24} className="text-success" />
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Monthly Value</h6>
                  <h3 className="mb-0">{formatCurrency(getTotalBenefitValue())}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                  <TrendingUp size={24} className="text-info" />
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Annual Value</h6>
                  <h3 className="mb-0">{formatCurrency(getAnnualBenefitValue())}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                  <Award size={24} className="text-warning" />
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Categories</h6>
                  <h3 className="mb-0">
                    {Object.values(categorizedBenefits).filter(cat => cat.length > 0).length}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loading ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2 text-muted">Loading your benefits...</p>
          </Card.Body>
        </Card>
      ) : benefits.length > 0 ? (
        <>
          {/* Benefits by Category */}
          {Object.entries(categorizedBenefits).map(([category, categoryBenefits]) => (
            categoryBenefits.length > 0 && (
              <Card key={category} className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{category} Benefits</h5>
                    <Badge bg="primary">
                      {categoryBenefits.length} benefit{categoryBenefits.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0">Benefit Type</th>
                        <th className="border-0">Monthly Value</th>
                        <th className="border-0">Annual Value</th>
                        <th className="border-0">Description</th>
                        <th className="border-0">Assigned Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryBenefits.map((benefit) => (
                        <tr key={benefit.BenefitId}>
                          <td>
                            <div className="d-flex align-items-center">
                              <Badge 
                                bg={getBenefitTypeColor(benefit.BenefitType)} 
                                className="me-2"
                              >
                                <Gift size={12} className="me-1" />
                                {benefit.BenefitType}
                              </Badge>
                            </div>
                          </td>
                          <td>
                            <strong className="text-success">
                              {formatCurrency(benefit.Amount)}
                            </strong>
                          </td>
                          <td>
                            <span className="text-muted">
                              {formatCurrency(benefit.Amount * 12)}
                            </span>
                          </td>
                          <td>
                            <div 
                              className="text-truncate" 
                              style={{ maxWidth: '250px' }}
                              title={benefit.Description}
                            >
                              <FileText size={14} className="me-1 text-muted" />
                              {benefit.Description}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center text-muted">
                              <Calendar size={14} className="me-1" />
                              {formatDate(benefit.AssignedDate)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )
          ))}

          {/* Benefits Summary */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <DollarSign size={20} className="me-2" />
                Benefits Summary
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6 className="text-muted">Monthly Benefits Value</h6>
                  <h4 className="text-success mb-3">{formatCurrency(getTotalBenefitValue())}</h4>
                  
                  <h6 className="text-muted">Annual Benefits Value</h6>
                  <h4 className="text-success mb-3">{formatCurrency(getAnnualBenefitValue())}</h4>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted">Benefit Categories</h6>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {Object.entries(categorizedBenefits).map(([category, categoryBenefits]) => (
                      categoryBenefits.length > 0 && (
                        <Badge key={category} bg="outline-primary" className="px-3 py-2">
                          {category} ({categoryBenefits.length})
                        </Badge>
                      )
                    ))}
                  </div>
                  
                  <Alert variant="info" className="mb-0">
                    <strong>Note:</strong> These benefits are part of your total compensation package. 
                    For questions about your benefits, please contact HR.
                  </Alert>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <Gift size={64} className="text-muted mb-3" />
            <h4 className="text-muted">No Benefits Assigned</h4>
            <p className="text-muted">
              You don't have any benefits assigned to your account yet. 
              Please contact HR if you believe this is an error.
            </p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Benefits;