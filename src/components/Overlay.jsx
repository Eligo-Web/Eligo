import { IconX } from "@tabler/icons-react";
import { useContext, useEffect, useState } from "react";
import { Button, Row } from "react-bootstrap";
import { EditPopupContext } from "../containers/InAppContainer";
import "../styles/overlay.css";
import { CreateClass, EditClass } from "./CreateOrEditClass";
import { CreateSession, EditSession } from "./CreateOrEditSession";
import { ClosedPoll } from "./InstructorPoll";
import { ConfirmDelete, Default, JoinClass, JoinSession } from "./Popups";
import { closePopup } from "./Utils";

/**
 *
 * @param {{title: string, content: Object}} props
 */
export default function Overlay(props) {
  const [childState, setChildState] = useState(false);
  const [markDelete, setMarkDelete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [popup, setPopup] = useContext(EditPopupContext);

  async function close() {
    if (!props.warning) setChildState(!childState);
    if (props.vote || props.poll) closePopup(props.id, setPopup);
  }

  useEffect(() => {
    if (!props.editClass && !props.editSession) return;
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
            {props.title || "Overlay Title"}
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
          />
        ) : props.poll ? (
          <ClosedPoll
            pollId={props.id}
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
        {(props.editClass || props.editSession) && (
          <ConfirmDelete
            id={props.id || "no-id"}
            cancelClick={() => setMarkDelete(false)}
            deleteClick={() => setConfirmDelete(true)}
          />
        )}
      </div>
      <div className="overlay-bg" onClick={close} />
    </div>
  );
}
