import { Button, Row } from "react-bootstrap";
import { IoIosClose } from "react-icons/io";
import { ConfirmDelete, Default, JoinClass, JoinSession } from "./Popups";
import { CreateSession, EditSession } from "./CreateOrEditSession";
import { CreateClass, EditClass } from "./CreateOrEditClass";
import { useEffect, useState } from "react";
import { ClosedPoll } from "./InstructorPoll";
import "../styles/overlay.css";

export function openPopup(id) {
  const overlay = document.getElementById(id + "-popup");
  if (overlay) {
    document.body.style.overflow = "hidden";
    overlay.querySelector(".overlay-bg").style.pointerEvents = "all";
    overlay.querySelector(".overlay-bg").style.opacity = 100;
    overlay.querySelector(".pop-up").style.opacity = 100;
    const form = overlay.querySelector(".form-control");
    if (form) overlay.querySelector(".form-control").focus();
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
  const [markDelete, setMarkDelete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function close() {
    if (!props.warning) setChildState(!childState);
    closePopup(props.id);
    setMarkDelete(false);
  }

  useEffect(() => {
    if (props.vote || props.closedPoll) return;
    const overlay = document.getElementById(props.id + "-popup");
    const buttonRow = overlay.querySelector(".button-row");
    const deleteBtns = overlay.querySelector(".delete-popup");
    if (markDelete) {
      deleteBtns.style.transition = "0.1s ease-in";
      buttonRow.style.transition = "0.1s ease-out";
      deleteBtns.style.maxHeight = "10rem";
      deleteBtns.style.margin = 0;
      buttonRow.style.maxHeight = 0;
      buttonRow.style.margin = "-0.5rem 0";
    } else {
      deleteBtns.style.transition = "0.1s ease-out";
      buttonRow.style.transition = "0.1s ease-in";
      deleteBtns.style.maxHeight = 0;
      deleteBtns.style.margin = "-0.5rem 0";
      buttonRow.style.maxHeight = "10rem";
      buttonRow.style.margin = 0;
    }
  }, [markDelete]);

  return (
    <div className="overlay-wrapper" id={props.id + "-popup"}>
      <div style={{ zIndex: 3 }}>
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
                setMarkDelete={setMarkDelete}
                confirmDelete={confirmDelete}
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
          ) : props.editSession ? (
            <EditSession
              id={props.id}
              session={props.session}
              weekNum={props.weekNum}
              sectionId={props.sectionId}
              refresh={props.refresh}
              setRefresh={props.setRefresh}
              setMarkDelete={setMarkDelete}
              confirmDelete={confirmDelete}
              control={childState}
            />
          ) : props.joinSession ? (
            <JoinSession
              childProps={props.joinSessionProps}
              control={childState}
            />
          ) : props.closedPoll ? (
            <ClosedPoll
              sectionId={props.childContent.sectionId}
              weekNum={props.childContent.weekNum}
              sessionId={props.childContent.sessionId}
              pollId={props.pollId}
              refresh={props.refresh}
              setRefresh={props.setRefresh}
            />
          ) : (
            props.content || <Default />
          )}
          <ConfirmDelete
            cancelClick={() => setMarkDelete(false)}
            deleteClick={() => setConfirmDelete(true)}
          />
        </div>
      </div>
      <div className="overlay-bg" onClick={() => close()} />
    </div>
  );
}
