import "../styles/text.css";
import "../styles/buttons.css";
import "../styles/overlay.css";
import { IoIosArrowBack } from "react-icons/io";

import { useRef, useEffect } from "react";
import { Button, Col, Container } from "react-bootstrap";

function Menu(props) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  function closeMenu() {
    document.querySelector(".menu-overlay-bg").style.pointerEvents = "none";
    document.querySelector(".menu-overlay-bg").style.opacity = 0;
    document.querySelector(".menu").style.left = "-17rem";
  }

  return (
    <div>
      <div className="overlay menu" ref={menuRef}>
        <Container className="menu-overlay-header">
          <Button variant="transparent" className="menu-overlay-back">
            <IoIosArrowBack size="2.3rem" onClick={closeMenu} />
          </Button>
          <div className="menu-overlay-title">EduPoll</div>
        </Container>
      </div>
      <div className="menu-overlay-bg" />
    </div>
  );
}

export default Menu;
