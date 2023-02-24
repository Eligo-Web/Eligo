import "../styles/texts.css";
import "../styles/buttons.css";
import "../styles/overlay.css";
import { IoIosArrowBack } from "react-icons/io";

import { useRef, useEffect } from "react";
import { Button } from "react-bootstrap";

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
    document.querySelector(".menu").style.width = 0;
  }

  return (
    <div>
      <div className="overlay menu" ref={menuRef}>
        <Button variant="transparent">
          <IoIosArrowBack size="3rem" onClick={closeMenu} />
        </Button>
      </div>
      <div className="menu-overlay-bg" />
    </div>
  );
}

export default Menu;
