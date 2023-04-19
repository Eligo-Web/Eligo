import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { IoIosMenu } from "react-icons/io";
import { IconButton } from "./Buttons.jsx";

import { IconCheck, IconCopy } from "@tabler/icons-react";
import "../styles/menu.css";
import "../styles/text.css";

function MenuBar(props) {
  const [copied, setCopied] = useState(false);

  function openMenu() {
    document.body.style.overflowY = "hidden";
    const menuContainer = document.getElementById("side-menu");
    const menuBG = menuContainer.querySelector(".overlay-bg");
    const menu = menuContainer.querySelector(".menu");
    menuBG.style.pointerEvents = "all";
    menuBG.style.opacity = 1;
    menuBG.style.transition = "0.5s cubic-bezier(0.5, 0.05, 0, 1)";
    menu.style.transition = "0.5s cubic-bezier(0.5, 0.05, 0, 1)";
    menu.style.transform = "translate(18rem,0)";
  }

  function copyDescription() {
    if (props.clickable) {
      try {
        navigator.clipboard.writeText(props.description);
        setCopied(true);
        setTimeout(() => setCopied(false), 5000);
      } catch (err) {
        console.error("Failed to copy!", err);
      }
    }
  }

  return (
    <Container fluid className="menu-bar">
      <Button variant="transparent" onClick={openMenu} aria-label="Open Menu">
        <IoIosMenu size="2.3em" alt="Button to open menu overlay" />
      </Button>
      <Row className="menu-bar-items">
        <Col className="large-title menu-bar-title">
          {props.title || "-Untitled-"}
        </Col>
        {props.showDescription ? (
          <Col
            className="large-title menu-bar-subtitle"
            onClick={() => copyDescription()}
          >
            <div
              className="copy-success"
              style={{
                opacity: copied ? "100%" : 0,
                width: copied ? "10rem" : 0,
              }}
            >
              Copied!
              <IconCheck
                stroke="0.16rem"
                style={{ flexShrink: 0 }}
                alt="Icon indicator of successful copy"
              />
            </div>
            <IconButton
              style={{
                padding: "1rem",
                cursor: props.clickable ? "pointer" : "default",
              }}
              icon={
                props.clickable ? (
                  <IconCopy size="1.5em" alt="Copy passcode" />
                ) : null
              }
              label={props.description || "None"}
              variant="transparent"
            />
          </Col>
        ) : null}
      </Row>
    </Container>
  );
}

export default MenuBar;
