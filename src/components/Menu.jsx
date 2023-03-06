import "../styles/text.css";
import "../styles/buttons.css";
import "../styles/overlay.css";
import {
  IoIosArrowBack,
  IoMdExit,
  IoMdAddCircleOutline,
  IoMdPerson,
} from "react-icons/io";
import { IconButton } from "./Buttons.jsx";
import { Button, Container } from "react-bootstrap";
import { openPopup } from "./Overlay";

import { useLocation, useNavigate } from "react-router-dom";
import { IconTrash } from "@tabler/icons-react";

function Menu(props) {
  const location = useLocation();
  const navigate = useNavigate();
  let getLabel = "Join Class";
  if (location.state.permission === "instructor") {
    getLabel = "Create Class";
  }
  if (props.leaveAction) {
    getLabel = "Leave Class";
  }

  function closeMenu(overlay) {
    const menu = document.getElementById("side-menu");
    menu.querySelector(".overlay-bg").style.pointerEvents = "none";
    menu.querySelector(".overlay-bg").style.opacity = 0;
    menu.querySelector(".menu").style.left = "-18rem";
    document.body.style.overflow = "overlay";
    console.log("closed menu");
    openPopup(overlay);
  }

  function handleSignOut() {
    closeMenu();
    navigate("/");
  }

  return (
    <div id="side-menu">
      <div className="overlay menu">
        <Container className="p-0">
          <Container className="menu-overlay-header">
            <Button variant="transparent" className="menu-overlay-back">
              <IoIosArrowBack size="2.3rem" onClick={closeMenu} />
            </Button>
            <div className="menu-overlay-title">EduPoll</div>
          </Container>
          <Container className="d-flex flex-row p-3 gap-3 card-subtitle">
            <IoMdPerson size="2rem" />
            {location.state.permission}
          </Container>
        </Container>
        <Container className="d-flex flex-column p-3 gap-2 align-items-center">
          <IconButton
            label={getLabel}
            variant={props.leaveAction ? "delete" : ""}
            icon={
              props.leaveAction ? null : <IoMdAddCircleOutline size="2rem" />
            }
            onClick={() => closeMenu(getLabel)}
          />
          <IconButton
            label="Sign Out"
            variant="sign-out"
            icon={<IoMdExit size="2rem" />}
            onClick={handleSignOut}
          />
        </Container>
      </div>
      <div className="overlay-bg" onClick={closeMenu} />
    </div>
  );
}

export default Menu;
