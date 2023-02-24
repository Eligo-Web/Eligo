import { useRef, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
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
    document.querySelector(".pop-up").style.top = "100%";
    document.querySelector(".overlay-bg").style.pointerEvents = "none";
    document.querySelector(".overlay-bg").style.opacity = 0;
  }

  return (
    <div>
      <Container className="overlay pop-up" ref={popupRef}>
        <Container className="header">
          <Row>Name</Row>
          <Row>Icon</Row>
        </Container>
        <Container>
          wief ygoqwefy goqfeyg oqyfeg oqyief goqyefg oqyie gde qoey dgqoyegd
          oquyg oyug kuhweg flugdopf iug osuhajhwd kah ique hoia fqhe ouhsic
          aoef hqojh 9ughlmrbfw uefhwe
        </Container>
      </Container>
      <div className="overlay-bg" />
    </div>
  );
}

export default Overlay;
