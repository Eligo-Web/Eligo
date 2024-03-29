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

import { IconInfoCircle, IconLock } from "@tabler/icons-react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { server } from "../ServerUrl";
import { GlobalPopupContext } from "../containers/InAppContainer";
import { PrimaryButton } from "./Buttons.jsx";
import InputField from "./InputField";
import { FloatError } from "./Popups";
import pause, { closePopup, sessionValid } from "./Utils";

export function CreateSession(props) {
  return (
    <CreateOrEditSession
      id="create-session"
      sectionId={props.sectionId}
      refresh={props.refresh}
      setRefresh={props.setRefresh}
      control={props.control}
    />
  );
}

export function EditSession(props) {
  return (
    <CreateOrEditSession
      id={props.id}
      session={props.session}
      weekNum={props.weekNum}
      sectionId={props.sectionId}
      refresh={props.refresh}
      setRefresh={props.setRefresh}
      markDelete={props.markDelete}
      setMarkDelete={props.setMarkDelete}
      confirmDelete={props.confirmDelete}
      control={props.control}
      editMode
    />
  );
}

function CreateOrEditSession(props) {
  const [sessionName, setSessionName] = useState(
    props.editMode ? props.session.name : ""
  );
  const [locError, setLocError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useContext(GlobalPopupContext);
  const timeStamp = props.id.replace("session-", "");
  const popupId = `content-${props.id}-popup`;

  useEffect(() => {
    const overlay = document.getElementById(popupId);
    if (!overlay) return;
    const isOpen = !!overlay.parentNode.isOpen;
    if (isOpen && props.control) {
      clearContents();
    }
  }, [props.control]);

  useEffect(() => {
    if (props.confirmDelete) {
      handleDelete();
    }
  }, [props.confirmDelete]);

  const handleKeyPresses = (event) => {
    switch (event.key) {
      case "Escape":
        clearContents();
        break;
      case "Enter":
        handleSaveCreate();
        break;
    }
  };

  function getWeekNumber(offset) {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const yrProgress = (currentDate - startDate) / (24 * 60 * 60 * 1000);
    const currWeekNum = Math.ceil(yrProgress / 7) + (offset || 0);
    return `${currentDate.getFullYear()}-${currWeekNum}`;
  }

  async function createSession() {
    const sessionId = `session-${Date.now()}`;
    const locationSwitch = document.getElementById("location-switch");
    await axios
      .put(`${server}/course/${props.sectionId}/${getWeekNumber()}/closeAll`, {
        email: props.email,
      })
      .catch((err) => {
        if (!sessionValid(err.response, setPopup)) return;
      });
    let latitude = 0;
    let longitude = 0;
    let thisError = 0;
    if (locationSwitch.checked) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
          },
          (error) => {
            thisError = error.PERMISSION_DENIED;
            if (thisError) setLocError(true);
          }
        );
        while (latitude === 0 && longitude === 0 && !thisError) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }
    }
    if (!thisError) {
      await axios
        .post(`${server}/course/${props.sectionId}/${sessionId}`, {
          name: sessionName ? sessionName : new Date().toDateString(),
          passcode: Math.random().toString(10).slice(-4),
          weekNum: getWeekNumber(),
          latitude: latitude,
          longitude: longitude,
          email: props.email,
        })
        .catch((err) => {
          if (!sessionValid(err.response, setPopup)) return;
        });
      props.setRefresh(!props.refresh);
      closePopup(props.id, setPopup);
    } else {
      setSaving(false);
    }
  }

  async function handleEdit() {
    if (sessionName === props.session.name) {
      closePopup(props.id, setPopup);
      setSaving(false);
      return;
    }
    await axios
      .patch(
        `${server}/course/${props.sectionId}/${props.weekNum}/${props.id}`,
        {
          name: sessionName ? sessionName : new Date().toDateString(),
          email: props.email,
        }
      )
      .catch((err) => {
        if (!sessionValid(err.response, setPopup)) return;
      });
    props.setRefresh(!props.refresh);
    closePopup(props.id, setPopup);
  }

  async function handleDelete() {
    await axios
      .delete(
        `${server}/course/${props.sectionId}/${props.weekNum}/${props.id}`
      )
      .catch((err) => {
        if (!sessionValid(err.response, setPopup)) return;
      });
    props.setRefresh(!props.refresh);
    closePopup(props.id, setPopup);
  }

  async function handleSaveCreate() {
    setSaving(true);
    props.editMode ? await handleEdit() : await createSession();
  }

  async function clearContents() {
    const overlay = document.getElementById(popupId);
    if (props.editMode && props.markDelete) {
      props.setMarkDelete(false);
      await pause(300);
    }
    const nameField = overlay.querySelector(".session-name-input");
    const locationSwitch = document.getElementById("location-switch");
    nameField.value = props.editMode ? props.session.name : "";
    if (!props.editMode) locationSwitch.checked = false;
    setLocError(false);
    setSessionName(props.editMode ? props.session.name : "");
    await pause(100);
    closePopup(props.id, setPopup);
  }

  return (
    <div
      className="pop-up-content session-width"
      id={popupId}
      onKeyDown={handleKeyPresses}
    >
      <InputField
        class="session-name-input"
        label="Session Name"
        default={
          props.editMode ? props.session.name : new Date().toDateString()
        }
        input={`Default: ${new Date().toDateString()}`}
        onChange={(e) => setSessionName(e.target.value)}
      />
      {props.editMode && (
        <div className="input-group">
          <InputField
            label="Date Created"
            value={new Date(parseInt(timeStamp)).toLocaleString()}
            disabled
          />
          <InputField
            small
            label="Passcode"
            value={props.session.passcode}
            disabled
          />
        </div>
      )}
      <div className="flex-row input-field align-items-center gap-2">
        {props.editMode && <IconLock size="1em" stroke="0.15rem" />}
        <Form.Switch
          type="switch"
          id="location-switch"
          label="Require Attendance"
          className="location-switch input-field"
          checked={
            props.editMode &&
            (props.session.latitude || props.session.longitude)
          }
          disabled={props.editMode}
        />
        <div className="location-switch-info d-grid">
          <div className="location-tooltip">
            When enabled, students must enable location services to join the
            session. You can access their location by downloading the session
            data.
          </div>
          <IconInfoCircle size="1.1em" stroke="0.14rem" />
        </div>
      </div>
      <FloatError msg={locError && "Location permission denied!"} />
      <div className="button-row">
        {props.editMode && (
          <PrimaryButton
            variant="delete"
            label="Delete"
            onClick={() => props.setMarkDelete(true)}
          />
        )}
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => clearContents()}
        />
        <PrimaryButton
          variant="primary"
          id={"save-" + props.id}
          label={props.editMode ? "Save" : "Create"}
          onClick={handleSaveCreate}
          style={{ maxHeight: "100%" }}
          loading={saving}
        />
      </div>
    </div>
  );
}
