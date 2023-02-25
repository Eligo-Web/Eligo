import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "../styles/text.css";
import "../styles/buttons.css";

function PollCard(props) {
  return (
    <Container className="card session-card clickable">
      <Row>
        <Col className="card-title session-card-title">Session 1</Col>
        <Col className="card-title session-card-subtitle">Active</Col>
      </Row>
    </Container>
  );
}

export default PollCard;
