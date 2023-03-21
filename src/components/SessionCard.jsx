import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { IconPencil } from "@tabler/icons-react";
import { openPopup } from "./Overlay";
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
    openPopup(props.id);
  };

  return (
    <Container className={activity} onClick={props.onClick}>
        {props.title ? (
      <Row className="align-items-center">
        <Col className="card-title session-card-title">{props.title}</Col>
        <Col className="card-title session-card-subtitle">        
            {label}
          <IconPencil
            id="edit-button"
            className="session-edit-button"
            size={"2.7em"}
            onClick={handleEdit}
          />
        </Col>
      </Row>
        ) : null}
    </Container>
  );
}

export default SessionCard;
