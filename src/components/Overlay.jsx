import { Button, Col, Container, Row } from "react-bootstrap";
import { IoIosClose } from "react-icons/io";
import { Default } from "./Popups";
import "../styles/overlay.css";

function Overlay(props) {
  function closePopup() {
    console.log("closed", props.id);
    document.body.style.overflow = "auto";
    const thisOverlay = document.getElementById(props.id);
    thisOverlay.querySelector(".overlay-bg").style.pointerEvents = "none";
    thisOverlay.querySelector(".overlay-bg").style.opacity = 0;
    thisOverlay.querySelector(".pop-up").style.opacity = 0;
    thisOverlay.style.height = 0;
  }

  return (
    <div className="overlay-wrapper" id={props.id}>
      <div className="overlay pop-up">
        <div className="pop-up-header">
          <Row className="pop-up-title large-title">
            {props.title || "Overlay Title"}
          </Row>
          <Button variant="transparent">
            <IoIosClose size={"3rem"} onClick={closePopup} />
          </Button>
        </div>
        {props.content || <Default />}
      </div>
      <div className="overlay-bg" onClick={closePopup} />
    </div>
  );
}

export default Overlay;
