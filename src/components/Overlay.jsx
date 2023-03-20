import { Button, Row } from "react-bootstrap";
import { IoIosClose } from "react-icons/io";
import { CreateSession, Default, JoinClass } from "./Popups";
import "../styles/overlay.css";
import { CreateClass, EditClass } from "./CreateOrEditClass";
import { useEffect, useState } from "react";

export function openPopup(id) {
  const overlay = document.getElementById(id + "-popup");
  if (overlay) {
    document.body.style.overflow = "hidden";
    overlay.querySelector(".overlay-bg").style.pointerEvents = "all";
    overlay.querySelector(".overlay-bg").style.opacity = 100;
    overlay.querySelector(".pop-up").style.opacity = 100;
    overlay.querySelector(".form-control").focus();
    overlay.style.height = "100vh";
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
  }
}

/**
 *
 * @param {{title: string, content: Object}} props
 */
export default function Overlay(props) {
  const [childState, setChildState] = useState(false);
  function close() {
    if (!props.warning) setChildState(!childState);
    closePopup(props.id);
  }

  return (
    <div className="overlay-wrapper" id={props.id + "-popup"}>
      <div className="overlay pop-up">
        <div className="pop-up-header">
          <Row className="pop-up-title large-title">
            {props.title || "Overlay Title"}
          </Row>
          <Button variant="transparent">
            <IoIosClose size={"2.5em"} onClick={() => close()} />
          </Button>
        </div>
        {props.instructor ? (
          props.editMode ? (
            <EditClass
              childContent={props.childContent}
              refresh={props.refresh}
              setRefresh={props.setRefresh}
              control={childState}
            />
          ) : (
            <CreateClass
              refresh={props.refresh}
              setRefresh={props.setRefresh}
              control={childState}
            />
          )
        ) : props.joinClass ? (
          <JoinClass
            name={props.state.name}
            email={props.state.email}
            history={props.state.history}
            refresh={props.refresh}
            setRefresh={props.setRefresh}
            control={childState}
          />
        ) : props.createSession ? (
          <CreateSession
            sectionId={props.sectionId}
            refresh={props.refresh}
            setRefresh={props.setRefresh}
            control={childState}
          />
        ) : (
          props.content || <Default />
        )}
      </div>
      <div className="overlay-bg" onClick={() => close()} />
    </div>
  );
}
