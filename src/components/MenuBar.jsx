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
    const menu = document.getElementById("side-menu");
    menu.querySelector(".overlay-bg").style.pointerEvents = "all";
    menu.querySelector(".overlay-bg").style.opacity = 100;
    menu.querySelector(".menu").style.left = 0;
    console.log("opened menu");
  }
  return (
    <Container fluid className="menu-bar">
      <Button variant="transparent" onClick={openMenu}>
        <IoIosMenu size="3rem" />
      </Button>
      <Row className="menu-bar-items">
        <Col className="large-title">{props.title}</Col>
        <Col className="large-title">{props.description}</Col>
      </Row>
    </Container>
  );
}

export default MenuBar;
