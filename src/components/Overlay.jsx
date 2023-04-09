import { useContext, useEffect, useState } from "react";
import { Button, Row } from "react-bootstrap";
import { IoIosClose } from "react-icons/io";
import { EditPopupContext } from "../containers/InAppContainer";
import { pause } from "../pages/CourseView";
import "../styles/overlay.css";
import { CreateClass, EditClass } from "./CreateOrEditClass";
import { CreateSession, EditSession } from "./CreateOrEditSession";
import { ClosedPoll } from "./InstructorPoll";
import { ConfirmDelete, Default, JoinClass, JoinSession } from "./Popups";

export function openPopup(id) {
  const overlay = document.getElementById(id + "-popup");
  if (id === "Create Session") {
    const nameField = overlay.querySelector(".session-name-input");
    nameField.value = new Date().toDateString();
  }
  if (overlay) {
    overlay.style.maxHeight = "100vh";
    overlay.style.overflow = "visible";
    document.body.style.overflowY = "hidden";
    overlay.querySelector(".pop-up").style.opacity = 1;
    const bg = overlay.querySelector(".overlay-bg");
    const form = overlay.querySelector(".form-control");
    if (bg) bg.style.opacity = 1;
    pause(350).then(() => {
      if (bg) bg.style.pointerEvents = "all";
      if (form) form.focus();
    });
  }
}

export async function closePopup(id, setPopup) {
  const overlay = document.getElementById(id + "-popup");
  if (overlay) {
    overlay.style.maxHeight = 0;
    document.body.style.overflowY = "overlay";
    overlay.style.overflow = "hidden";
    overlay.querySelector(".overlay-bg").style.opacity = 0;
    overlay.querySelector(".pop-up").style.opacity = 0;
    overlay.querySelector(".overlay-bg").style.pointerEvents = "none";
  }
  await pause();
  if (setPopup) setPopup(null);
}

/**
 *
 * @param {{title: string, content: Object}} props
 */
export default function Overlay(props) {
  const [childState, setChildState] = useState(false);
  const [markDelete, setMarkDelete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [popup, setPopup] = useContext(EditPopupContext);

  function close() {
    if (!props.warning) setChildState(!childState);
    closePopup(props.id, setPopup);
    setMarkDelete(false);
  }

  useEffect(() => {
    if (props.vote || props.poll) return;
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
      <div className="overlay pop-up" style={{ zIndex: 4 }}>
        <div className="pop-up-header">
          <Row className="pop-up-title large-title">
            {props.title + (props.activePoll ? " - Save Error" : "") ||
              "Overlay Title"}
          </Row>
          <Button
            variant="transparent"
            aria-label={`Close Overlay ${props.title}`}
          >
            <IoIosClose size={"2.5em"} onClick={() => close()} />
          </Button>
        </div>
        {props.createClass ? (
          <CreateClass
            refresh={props.refresh}
            setRefresh={props.setRefresh}
            control={childState}
          />
        ) : props.editClass ? (
          <EditClass
            childContent={props.childContent}
            refresh={props.refresh}
            setRefresh={props.setRefresh}
            setMarkDelete={setMarkDelete}
            confirmDelete={confirmDelete}
            control={childState}
            overrideInit
          />
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
            overrideInit
          />
        ) : props.joinSession ? (
          <JoinSession
            childProps={props.joinSessionProps}
            control={childState}
          />
        ) : props.poll ? (
          <ClosedPoll
            sectionId={props.childContent.sectionId}
            weekNum={props.childContent.weekNum}
            sessionId={props.childContent.sessionId}
            pollId={props.pollId}
            refresh={props.refresh}
            setRefresh={props.setRefresh}
            unresolved={props.activePoll}
          />
        ) : (
          props.content || <Default />
        )}
        <ConfirmDelete
          id={props.id || "no-id"}
          cancelClick={() => setMarkDelete(false)}
          deleteClick={() => setConfirmDelete(true)}
        />
      </div>
      <div className="overlay-bg" onClick={close} />
    </div>
  );
}
