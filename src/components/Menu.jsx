import "../styles/text.css";
import "../styles/buttons.css";
import "../styles/overlay.css";
import {
  IoIosArrowBack,
  IoMdExit,
  IoMdAddCircleOutline,
  IoMdPerson,
} from "react-icons/io";
import IconButton from "../components/Buttons/IconButton";
import { Button, Container } from "react-bootstrap";
import { openPopup } from "./Overlay";

import { useLocation, useNavigate } from "react-router-dom";

function Menu(props) {
  const location = useLocation();
  const navigate = useNavigate();
  let getLabel = "Join Class";
  if (location.state.permission === "instructor") {
    getLabel = "Create Class";
  }
  function closeMenu(overlay) {
    const menu = document.getElementById("side-menu");
    menu.querySelector(".overlay-bg").style.pointerEvents = "none";
    menu.querySelector(".overlay-bg").style.opacity = 0;
    menu.querySelector(".menu").style.left = "-18rem";
    document.body.style.overflow = "auto";
    console.log("closed menu");
    openPopup(overlay);
  }

  function handleSignOut() {
    navigate("/");
  }

  return (
    <div id="side-menu">
      <div className="overlay menu">
        <Container className="menu-overlay-header">
          <Button variant="transparent" className="menu-overlay-back">
            <IoIosArrowBack size="2.3rem" onClick={closeMenu} />
          </Button>
          <div className="menu-overlay-title">EduPoll</div>
        </Container>
        <Container className="d-flex flex-column p-3 gap-2">
          <IconButton
            label={location.state.permission}
            variant="transparent"
            icon={<IoMdPerson size="2rem" />}
          />
        </Container>
        <Container className="d-flex flex-column p-3 gap-2">
          <IconButton
            label={getLabel}
            icon={<IoMdAddCircleOutline size="2rem" />}
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
