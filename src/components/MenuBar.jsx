import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { IoIosMenu } from "react-icons/io";

import "../styles/text.css";
import "../styles/menu.css";

function MenuBar(props) {
  function openMenu() {
    document.body.style.overflow = "hidden";
    console.log("opened menu");
    document.querySelector(".menu-overlay-bg").style.pointerEvents = "all";
    document.querySelector(".menu-overlay-bg").style.opacity = 100;
    document.querySelector(".menu").style.left = 0;
  }
  return (
    <Container fluid className="menu-bar">
      <Button variant="transparent" onClick={openMenu}>
        <IoIosMenu size="3rem" />
      </Button>
      <Row className="menu-bar-items">
        <Col className="large-title">Your Courses</Col>
        <Col className="large-title">EN.601.229</Col>
      </Row>
    </Container>
  );
}

export default MenuBar;
