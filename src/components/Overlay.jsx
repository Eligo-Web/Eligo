// Eligo is a web application primarily used for in-class polls.
// Copyright (C) 2023  Eligo-Web <smodare1@jhu.edu> <ffernan9@jhu.edu>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { IconX } from "@tabler/icons-react";
import { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { GlobalPopupContext } from "../containers/InAppContainer";
import "../styles/overlay.css";
import { CreateClass, EditClass } from "./CreateOrEditClass";
import { CreateSession, EditSession } from "./CreateOrEditSession";
import { ClosedPoll } from "./InstructorPoll";
import {
  ConfirmDelete,
  Default,
  JoinClass,
  JoinSession,
  SessionExpired,
} from "./Popups";
import { closePopup } from "./Utils";

/**
 *
 * @param {{title: string, content: Object}} props
 */
export default function Overlay(props) {
  const [childState, setChildState] = useState(false);
  const [markDelete, setMarkDelete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [popup, setPopup] = useContext(GlobalPopupContext);

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
          <div className="pop-up-title large-title">
            {props.title || "Overlay Title"}
          </div>
          <Button
            variant="transparent absolute-hint"
            aria-label={`Close Overlay ${props.title}`}
            style={{ display: props.sessionExpired ? "none" : "unset" }}
          >
            <IconX size={"1.7em"} color="black" onClick={() => close()} />
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
            markDelete={markDelete}
            setMarkDelete={setMarkDelete}
            confirmDelete={confirmDelete}
            control={childState}
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
            markDelete={markDelete}
            setMarkDelete={setMarkDelete}
            confirmDelete={confirmDelete}
            control={childState}
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
          />
        ) : props.sessionExpired ? (
          <SessionExpired />
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
