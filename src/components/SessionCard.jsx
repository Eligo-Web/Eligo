import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "../styles/text.css";
import "../styles/buttons.css";

function PollCard(props) {
  let activity = "card session-card clickable";
  if (props.activity === "Inactive") {
    activity = "card session-card clickable inactive";
  }
  return (
    <Container className={activity} onClick={props.onClick}>
      <Row>
        <Col className="card-title session-card-title">{props.title}</Col>
        <Col className="card-title session-card-subtitle">{props.activity}</Col>
      </Row>
    </Container>
  );
}

export default PollCard;
