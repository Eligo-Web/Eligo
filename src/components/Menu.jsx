import "../styles/texts.css";
import "../styles/buttons.css";
import "../styles/overlay.css";
import { IoIosArrowBack } from "react-icons/io";

import { useRef, useEffect } from "react";


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
    document.querySelector(".menu").style.width = "0";
  }
  return (
    <div className="overlay menu" ref={menuRef}>
      <IoIosArrowBack size="3rem" className="menu-back-button" onClick={closeMenu} />
    </div>
  )
}

export default Menu;
