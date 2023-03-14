import { Button, Row } from "react-bootstrap";
import { IoIosClose } from "react-icons/io";
import { Default } from "./Popups";
import "../styles/overlay.css";

export function openPopup(id) {
  const overlay = document.getElementById(id + "-popup");
  if (overlay) {
    document.body.style.overflow = "hidden";
    overlay.querySelector(".overlay-bg").style.pointerEvents = "all";
    overlay.querySelector(".overlay-bg").style.opacity = 100;
    overlay.querySelector(".pop-up").style.opacity = 100;
    overlay.style.height = "100vh";
    console.log("opened", id);
  }
}

export function closePopup(id) {
  const overlay = document.getElementById(id + "-popup");
  if (overlay) {
    overlay.style.height = 0;
    document.body.style.overflow = "auto";
    overlay.querySelector(".overlay-bg").style.opacity = 0;
    overlay.querySelector(".pop-up").style.opacity = 0;
    overlay.querySelector(".overlay-bg").style.pointerEvents = "none";
    console.log("closed", id);
  }
}

/**
 *
 * @param {{title: string, content: Object}} props
 */
export default function Overlay(props) {
  return (
    <div className="overlay-wrapper" id={props.id + "-popup"}>
      <div className="overlay pop-up">
        <div className="pop-up-header">
          <Row className="pop-up-title large-title">
            {props.title || "Overlay Title"}
          </Row>
          <Button variant="transparent">
            <IoIosClose size={"2.5em"} onClick={() => closePopup(props.id)} />
          </Button>
        </div>
        {props.content || <Default />}
      </div>
      <div className="overlay-bg" onClick={() => closePopup(props.id)} />
    </div>
  );
}
