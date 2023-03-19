import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "../styles/text.css";
import "../styles/buttons.css";

function SessionCard(props) {
  let activity = "card session-card clickable";
  let label = "Active";
  if (!props.active) {
    activity += " inactive";
    label = "Inactive";
  }
  return (
    <Container className={activity} onClick={props.onClick}>
      <Row>
        <Col className="card-title session-card-title">{props.title}</Col>
        <Col className="card-title session-card-subtitle">
          {props.title ? label : null}
        </Col>
      </Row>
    </Container>
  );
}

export default SessionCard;
