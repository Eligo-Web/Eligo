import { IconPencil } from "@tabler/icons-react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import "../styles/buttons.css";
import "../styles/text.css";

function SessionCard(props) {
  let activity = "card session-card clickable";
  let label = "Active";
  if (!props.active) {
    activity += " inactive";
    label = "Inactive";
  }

  const handleEdit = (event) => {
    event.stopPropagation();
    props.onEdit();
  };

  return (
    <Container className={activity} id={props.id} onClick={props.onClick}>
      {props.blank ? null : (
        <Row className="align-items-center">
          <Col className="card-title session-card-title">
            {props.title || "-Untitled-"}
          </Col>
          <Col className="card-title session-card-subtitle">
            <span style={{ opacity: "75%" }}>{label}</span>
            <IconPencil
              id="edit-button"
              className="session-edit-button"
              size={"2.7em"}
              onClick={handleEdit}
            />
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default SessionCard;
