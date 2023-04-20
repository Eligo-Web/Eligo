import { IconX } from "@tabler/icons-react";
import { useContext, useEffect, useState } from "react";
import { Button, Row } from "react-bootstrap";
import { EditPopupContext } from "../containers/InAppContainer";
import { pause } from "../pages/CourseView";
import "../styles/overlay.css";
import { CreateClass, EditClass } from "./CreateOrEditClass";
import { CreateSession, EditSession } from "./CreateOrEditSession";
import { ClosedPoll } from "./InstructorPoll";
import { ConfirmDelete, Default, JoinClass, JoinSession } from "./Popups";

export async function openPopup(id) {
  document.body.style.overflowY = "hidden";
  const overlay = document.getElementById(id + "-popup");
  if (overlay) {
    overlay.style.display = "flex";
    await pause(50);
    if (id === "Create Session") {
      const nameField = overlay.querySelector(".session-name-input");
      nameField.value = new Date().toDateString();
    }
    const overlayBG = overlay.querySelector(".overlay-bg");
    const overlayBody = overlay.querySelector(".pop-up");
    const form = overlay.querySelector(".form-control");
    overlay.style.maxHeight = "100vh";
    overlay.style.overflow = "visible";
    overlayBody.style.opacity = 1;
    overlayBody.style.transform = "scale(1)";
    overlayBody.isOpen = true;
    overlayBG.style.opacity = 1;
    pause(400).then(() => {
      overlayBG.style.pointerEvents = "all";
      if (form) form.focus();
    });
  }
}

export async function closePopup(id, setPopup) {
  const overlay = document.getElementById(id + "-popup");
  if (overlay) {
    const overlayBody = overlay.querySelector(".pop-up");
    const overlayBG = overlay.querySelector(".overlay-bg");
    overlayBG.style.pointerEvents = "none";
    overlay.style.maxHeight = "60vh";
    overlay.style.overflow = "hidden";
    overlayBG.style.opacity = 0;
    overlayBody.style.opacity = 0;
    overlayBody.style.transform = "scale(0.9)";
    overlayBody.isOpen = false;
    document.body.style.overflowY = "overlay";
    await pause();
    overlay.style.display = "none";
  }
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
    if (!popup) {
      closePopup(props.id, setPopup);
    }
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
            variant="transparent absolute-hint"
            aria-label={`Close Overlay ${props.title}`}
          >
            <IconX size={"1.7em"} color="black" onClick={() => close()} />
          </Button>
        </div>
        {props.createClass ? (
          <CreateClass
            refresh={props.refresh}
            setRefresh={props.setRefresh}
            control={childState}
            token={props.token}
          />
        ) : props.editClass ? (
          <EditClass
            childContent={props.childContent}
            refresh={props.refresh}
            setRefresh={props.setRefresh}
            markDelete={markDelete}
            setMarkDelete={setMarkDelete}
            confirmDelete={confirmDelete}
            control={childState}
            token={props.token}
          />
        ) : props.joinClass ? (
          <JoinClass
            name={props.state.name}
            email={props.state.email}
            history={props.state.history}
            refresh={props.refresh}
            setRefresh={props.setRefresh}
            control={childState}
            token={props.token}
          />
        ) : props.createSession ? (
          <CreateSession
            sectionId={props.sectionId}
            refresh={props.refresh}
            setRefresh={props.setRefresh}
            control={childState}
            token={props.token}
          />
        ) : props.editSession ? (
          <EditSession
            id={props.id}
            session={props.session}
            weekNum={props.weekNum}
            sectionId={props.sectionId}
            refresh={props.refresh}
            setRefresh={props.setRefresh}
            markDelete={markDelete}
            setMarkDelete={setMarkDelete}
            confirmDelete={confirmDelete}
            control={childState}
            token={props.token}
          />
        ) : props.joinSession ? (
          <JoinSession
            childProps={props.joinSessionProps}
            control={childState}
            token={props.token}
          />
        ) : props.poll ? (
          <ClosedPoll
            sectionId={props.childContent.sectionId}
            weekNum={props.childContent.weekNum}
            sessionId={props.childContent.sessionId}
            pollInfo={props.pollInfo}
            refresh={props.refresh}
            setRefresh={props.setRefresh}
            unresolved={props.activePoll}
            email={props.email}
            token={props.token}
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
