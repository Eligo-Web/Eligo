import "../styles/text.css";
import "../styles/buttons.css";
import "../styles/overlay.css";
import { IoIosArrowBack } from "react-icons/io";
import PrimaryButton from "../components/Buttons/PrimaryButton.jsx";
import { Button, Container } from "react-bootstrap";

function Menu(props) {
  function closeMenu() {
    console.log("closed menu");
    document.querySelector(".menu-overlay-bg").style.pointerEvents = "none";
    document.querySelector(".menu-overlay-bg").style.opacity = 0;
    document.querySelector(".menu").style.left = "-17rem";
    document.body.style.overflow = "auto";
  }

  return (
    <div>
      <div className="overlay menu">
        <Container className="menu-overlay-header">
          <Button variant="transparent" className="menu-overlay-back">
            <IoIosArrowBack size="2.3rem" onClick={closeMenu} />
          </Button>
          <div className="menu-overlay-title">EduPoll</div>
        </Container>
        <Container className="d-flex flex-column p-3 gap-2">
          <PrimaryButton />
          <PrimaryButton />
        </Container>
      </div>
      <div className="menu-overlay-bg" onClick={closeMenu} />
    </div>
  );
}

export default Menu;
