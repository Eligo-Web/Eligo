// Eligo is a web application primarily used for in-class polls.
// Copyright (C) 2023  Eligo-Web <smodare1@jhu.edu> <ffernan9@jhu.edu>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
