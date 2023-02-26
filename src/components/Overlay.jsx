import { useRef, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { IoIosClose } from "react-icons/io";
import "../styles/overlay.css";

function Overlay(props) {
  const popupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closePopup();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef]);

  function closePopup() {
    document.querySelector(".overlay-bg").style.pointerEvents = "none";
    document.querySelector(".overlay-bg").style.opacity = 0;
    document.querySelector(".pop-up").style.opacity = 0;
    document.querySelector(".overlay-wrapper").style.height = 0;
  }

  return (
    <div className="overlay-wrapper">
      <Container className="overlay pop-up" ref={popupRef}>
        <Container className="pop-up-header">
          <Row className="pop-up-title large-title">
            {props.title || "Untitled Overlay QWERTYUIOPYGQIDYF"}
          </Row>
          <Col onClick={closePopup}>
            <IoIosClose size={"3rem"} />
          </Col>
        </Container>
        <div>{props.contents}</div>
      </Container>
      <div className="overlay-bg" />
    </div>
  );
}

export default Overlay;
