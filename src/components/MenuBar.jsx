import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { IoIosMenu } from "react-icons/io";
import Menu from "./Menu";

import "../styles/texts.css";
import "../styles/menu.css";

function MenuBar(props) {
  function openMenu() {
    document.querySelector(".menu-overlay-bg").style.pointerEvents = "all";
    document.querySelector(".menu-overlay-bg").style.opacity = 100;
    document.querySelector(".menu").style.left = 0;
  }
  return (
    <Container fluid className="menu-bar">
      <Row className="menu-bar-items">
        <Col className="menu-bar-icon">
          <Button variant="transparent" onClick={openMenu}>
            <IoIosMenu size="3rem" />
          </Button>
        </Col>
        <Col xs="auto">Your Courses</Col>
        <Col className="menu-bar-detail">EN.601.229</Col>
      </Row>
    </Container>
  );
}

export default MenuBar;
