import { Card, Row, Col } from "react-bootstrap";
import { Users, DollarSign, Clock, Calendar } from "lucide-react";

const AdminDashboard = () => {
  // Dummy data
  const stats = [
    {
      title: "Total Employees",
      value: "245",
      icon: <Users size={24} />,
      color: "primary",
    },
    {
      title: "Payroll Processed",
      value: "$124,500",
      icon: <DollarSign size={24} />,
      color: "success",
    },
    {
      title: "Pending Approvals",
      value: "12",
      icon: <Clock size={24} />,
      color: "warning",
    },
    {
      title: "Leave Requests",
      value: "8",
      icon: <Calendar size={24} />,
      color: "info",
    },
  ];

  return (
    <div>
      <h2 className="mb-4">Admin Dashboard</h2>
      <Row className="g-4 mb-4">
        {stats.map((stat, index) => (
          <Col key={index} sm={6} lg={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">{stat.title}</h6>
                    <h3 className="mb-0">{stat.value}</h3>
                  </div>
                  <div
                    className={`bg-${stat.color} bg-opacity-10 p-3 rounded-circle`}
                  >
                    <div className={`text-${stat.color}`}>{stat.icon}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Row className="g-4">
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Payroll Overview</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                Monthly payroll distribution chart would appear here.
              </p>
              <div
                style={{
                  height: "300px",
                  background: "#f8f9fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p className="text-muted">Chart Placeholder</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Recent Activities</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                  <div className="text-primary">
                    <Users size={16} />
                  </div>
                </div>
                <div>
                  <p className="mb-0">New employee John Doe added</p>
                  <small className="text-muted">2 hours ago</small>
                </div>
              </div>

              <div className="d-flex mb-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                  <div className="text-success">
                    <DollarSign size={16} />
                  </div>
                </div>
                <div>
                  <p className="mb-0">April payroll processed</p>
                  <small className="text-muted">Yesterday</small>
                </div>
              </div>

              <div className="d-flex mb-3">
                <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                  <div className="text-warning">
                    <Calendar size={16} />
                  </div>
                </div>
                <div>
                  <p className="mb-0">3 leave requests pending approval</p>
                  <small className="text-muted">2 days ago</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
