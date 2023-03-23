import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { IconButton } from "./Buttons.jsx";
import { IoIosMenu } from "react-icons/io";

import "../styles/text.css";
import "../styles/menu.css";
import { IconCheck, IconCopy, IconMenu2 } from "@tabler/icons-react";

function MenuBar(props) {
  const [copied, setCopied] = useState(false);

  function openMenu() {
    document.body.style.overflow = "hidden";
    const menu = document.getElementById("side-menu");
    menu.querySelector(".overlay-bg").style.pointerEvents = "all";
    menu.querySelector(".overlay-bg").style.opacity = 100;
    menu.querySelector(".menu").style.left = 0;
    console.log("opened menu");
  }

  function copyDescription() {
    if (props.clickable) {
      try {
        navigator.clipboard.writeText(props.description);
        console.log("Copied to clipboard!");
        setCopied(true);
        setTimeout(() => setCopied(false), 5000);
      } catch (err) {
        console.error("Failed to copy!", err);
      }
    }
  }

  return (
    <Container fluid className="menu-bar">
      <Button variant="transparent" onClick={openMenu}>
        <IoIosMenu size="2.3em" />
      </Button>
      <Row className="menu-bar-items">
        <Col className="large-title">{props.title}</Col>
        {props.showDescription ? (
          <Col
            className="large-title d-flex flex-row align-items-center"
            onClick={() => copyDescription()}
          >
            <IconCheck
              size="1.4em"
              stroke="0.18rem"
              id="check"
              style={{
                opacity: copied ? 1 : 0,
                color: "#2a3c52",
                mixBlendMode: "hard-light",
                transition: "0.1s ease-in-out",
              }}
            />
            <IconButton
              style={{
                padding: "1rem",
                cursor: props.clickable ? "pointer" : "default",
              }}
              icon={props.clickable ? <IconCopy size="1.5em" /> : null}
              label={props.description || "No description"}
              variant="transparent"
            />
          </Col>
        ) : null}
      </Row>
    </Container>
  );
}

export default MenuBar;
