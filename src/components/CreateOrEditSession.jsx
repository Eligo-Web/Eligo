import {
  IconAlertTriangleFilled,
  IconInfoCircle,
  IconLock,
} from "@tabler/icons-react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { server } from "../ServerUrl";
import { EditPopupContext } from "../containers/InAppContainer";
import { pause } from "../pages/CourseView";
import { PrimaryButton } from "./Buttons.jsx";
import InputField from "./InputField";
import { closePopup } from "./Overlay";

export function CreateSession(props) {
  return (
    <CreateOrEditSession
      id="create-session"
      sectionId={props.sectionId}
      refresh={props.refresh}
      setRefresh={props.setRefresh}
      control={props.control}
      token={props.token}
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
      token={props.token}
      editMode
    />
  );
}

function CreateOrEditSession(props) {
  const [sessionName, setSessionName] = useState(
    props.editMode ? props.session.name : ""
  );
  const [locError, setLocError] = useState(false);
  const [popup, setPopup] = useContext(EditPopupContext);
  const timeStamp = props.id.replace("session-", "");
  const popupId = `content-${props.id}-popup`;
  const reset = true;

  useEffect(() => {
    const overlay = document.getElementById(popupId);
    if (!overlay) return;
    const isOpen = !!overlay.parentNode.isOpen;
    if (isOpen && props.control) {
      clearContents(reset);
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
        clearContents(reset);
        break;
      case "Enter":
        const button = document.getElementById("save-" + props.id + "-button");
        handleSaveCreate(null, button);
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
    const button = document.getElementById("create-session-button");
    let buttonText;
    if (button) {
      buttonText = button.childNodes[0];
      buttonText.data = "Creating...";
    }
    await axios.put(
      `${server}/course/${props.sectionId}/${getWeekNumber()}/closeAll`,
      {
        token: props.token,
        email: props.email,
      }
    );
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
      await axios.post(`${server}/course/${props.sectionId}/${sessionId}`, {
        name: sessionName ? sessionName : new Date().toDateString(),
        passcode: Math.random().toString(10).slice(-4),
        weekNum: getWeekNumber(),
        latitude: latitude,
        longitude: longitude,
        token: props.token,
        email: props.email,
      });
      props.setRefresh(!props.refresh);
      clearContents(reset);
    }
    if (buttonText) {
      buttonText.data = "Create";
    }
  }

  async function handleEdit() {
    await axios.patch(
      `${server}/course/${props.sectionId}/${props.weekNum}/${props.id}`,
      {
        name: sessionName ? sessionName : new Date().toDateString(),
        token: props.token,
        email: props.email,
      }
    );
    props.setRefresh(!props.refresh);
    clearContents(reset);
  }

  async function handleDelete() {
    await axios.delete(
      `${server}/course/${props.sectionId}/${props.weekNum}/${props.id}`,
      {
        headers: { token: props.token, email: props.email },
      }
    );
    props.setRefresh(!props.refresh);
    closePopup(props.id, setPopup);
  }

  async function handleSaveCreate(event, element = null) {
    const button = event ? event.target : element;
    const loadMsg = props.editMode ? "Saving..." : "Creating...";
    const original = button.childNodes[0].data;
    button.childNodes[0].data = loadMsg;
    props.editMode ? await handleEdit() : await createSession();
    button.childNodes[0].data = original;
  }

  async function clearContents(reset = false) {
    const overlay = document.getElementById(popupId);
    if (props.editMode && props.markDelete && reset) {
      props.setMarkDelete(false);
      await pause(300);
    }
    const nameField = overlay.querySelector(".session-name-input");
    const locationSwitch = document.getElementById("location-switch");
    if (reset) {
      nameField.value = props.editMode ? props.session.name : "";
      if (!props.editMode) locationSwitch.checked = false;
    }
    setLocError(false);
    setSessionName(props.editMode ? props.session.name : "");
    closePopup(props.id, setPopup);
  }

  return (
    <div className="pop-up-content" id={popupId} onKeyDown={handleKeyPresses}>
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
          <IconInfoCircle size="1.1em" stroke="0.14rem" />
        </div>
      </div>
      <div
        className="error-banner"
        style={{ display: locError ? "flex" : "none" }}
      >
        <IconAlertTriangleFilled />
        Location permission denied!
      </div>
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
          onClick={() => clearContents(reset)}
        />
        <PrimaryButton
          variant="primary"
          id={"save-" + props.id}
          label={props.editMode ? "Save" : "Create"}
          onClick={(event) => handleSaveCreate(event)}
        />
      </div>
    </div>
  );
}
