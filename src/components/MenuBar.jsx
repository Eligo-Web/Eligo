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
    menuBG.style.transition = "var(--open-bezier)";
    menu.style.transition = "var(--open-bezier)";
    menu.style.transform = `translateX(${menu.clientWidth}px)`;
    menu.style.boxShadow = "var(--menu-shadow)";
  }

  function copyDescription() {
    if (props.clickable) {
      try {
        const chip = document.querySelector(".copy-success");
        const width = chip.children[0].clientWidth;
        navigator.clipboard.writeText(props.description);
        setCopied(width);
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
                  width: copied ? `calc(${copied}px + 4.4rem)` : 0,
                }}
              >
                <span>Copied!</span>
                <IconCheck
                  stroke="0.16rem"
                  alt="Successfully copied to clipboard"
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
