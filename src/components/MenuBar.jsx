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
    const menu = document.getElementById("side-menu");
    menu.querySelector(".overlay-bg").style.pointerEvents = "all";
    menu.querySelector(".overlay-bg").style.opacity = 1;
    menu.querySelector(".menu").style.left = 0;
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
        <IoIosMenu size="2.3em" alt="Button to open menu overlay" />
      </Button>
      <Row className="menu-bar-items">
        <Col className="large-title">{props.title || "-Untitled-"}</Col>
        {props.showDescription ? (
          <Col
            className="large-title d-flex flex-row align-items-center"
            onClick={() => copyDescription()}
          >
            <div
              className="copy-success"
              style={{ opacity: copied ? 1 : 0, width: copied ? "10rem" : 0 }}
            >
              Copied!
              <IconCheck stroke="0.16rem" style={{ flexShrink: 0 }} alt="Icon indicator of successful copy" />
            </div>
            <IconButton
              style={{
                padding: "1rem",
                cursor: props.clickable ? "pointer" : "default",
              }}
              icon={props.clickable ? <IconCopy size="1.5em" alt="Copy passcode" /> : null}
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
