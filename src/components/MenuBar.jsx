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
  let ariaLabel;
  if (props.courseView) {
    ariaLabel = "Class code: ";
  } else if (props.sessionView) {
    ariaLabel = "session code: ";
  }
  ariaLabel += props.description;

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
        {props.showDescription && (
          <Col
            className="large-title menu-bar-subtitle gap-2"
            onClick={() => copyDescription()}
          >
            {props.clickable && (
              <div
                className="copy-success"
                style={{
                  opacity: copied ? "100%" : 0,
                  width: copied ? "8.8rem" : 0,
                }}
              >
                Copied!
                <IconCheck
                  stroke="0.16rem"
                  style={{ flexShrink: 0 }}
                  alt="Icon indicator of successful copy"
                />
              </div>
            )}
            <IconButton
              style={{
                borderRadius: "1rem",
                padding: "0.7rem 1rem",
                cursor: props.clickable ? "pointer" : "default",
              }}
              icon={
                props.clickable && <IconCopy size="1.5em" alt="Copy passcode" />
              }
              label={props.description}
              ariaLabel={ariaLabel}
              variant={`transparent ${props.clickable && "hover-hint"}`}
            />
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default MenuBar;
