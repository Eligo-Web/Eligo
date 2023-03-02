import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import "../styles/text.css";
import "../styles/menu.css";

function MenuBar(props) {
  return (
    <Container fluid className="menu-bar">
      <Button variant="transparent" onClick={props.onClick}>
        {props.icon}
      </Button>
      <Row className="menu-bar-items">
        <Col className="large-title">{props.title}</Col>
        <Col className="large-title">{props.description}</Col>
      </Row>
    </Container>
  );
}

export default MenuBar;
