import axios from "axios";
import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { PrimaryButton } from "./Buttons.jsx";
import InputField from "./InputField";
import { closePopup } from "./Overlay";

export function CreateSession(props) {
  return (
    <CreateOrEditSession
      id="create-session-popup"
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
  const editId = `edit-${props.id}-popup`;
  const timeStamp = props.id.replace("session-", "");

  useEffect(() => {
    const overlay = document.getElementById(
      props.editMode ? editId : props.id + "-popup"
    );
    if (overlay.offsetParent.style.height) {
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
        props.editMode ? handleEdit() : createSession();
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
    const server = "http://localhost:3000";
    const locationCheckbox = document.getElementById("location-checkbox");
    await axios.put(
      `${server}/course/${props.sectionId}/${getWeekNumber()}/closeAll`
    );
    let latitude = 0;
    let longitude = 0;
    if (locationCheckbox.checked) {
      if (navigator.geolocation) {
        await navigator.geolocation.getCurrentPosition(
          async (position) => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
          },
          (error) => {
            return;
          }
        );
        while (latitude === 0 && longitude === 0) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }
    }
    await axios.post(`${server}/course/${props.sectionId}/${sessionId}`, {
      name: sessionName ? sessionName : new Date().toDateString(),
      passcode: Math.random().toString(10).slice(-4),
      weekNum: getWeekNumber(),
      latitude: latitude,
      longitude: longitude,
    });
    props.setRefresh(!props.refresh);
    clearContents();
  }

  async function handleEdit() {
    const server = "http://localhost:3000";
    await axios.patch(
      `${server}/course/${props.sectionId}/${props.weekNum}/${props.id}`,
      {
        name: sessionName ? sessionName : new Date().toDateString(),
      }
    );
    props.setRefresh(!props.refresh);
    clearContents();
  }

  async function handleDelete() {
    const server = "http://localhost:3000";
    await axios.delete(
      `${server}/course/${props.sectionId}/${props.weekNum}/${props.id}`
    );
    props.setRefresh(!props.refresh);
    clearContents();
  }

  function clearContents() {
    const overlay = document.getElementById(
      props.editMode ? editId : props.id + "-popup"
    );
    if (props.editMode) props.setMarkDelete(false);
    const nameField = overlay.querySelector(".session-name-input");
    const locationCheckbox = document.getElementById("location-checkbox");
    nameField.value = props.editMode ? props.session.name : "";
    locationCheckbox.checked = false;
    setSessionName(props.editMode ? props.session.name : "");
    closePopup(props.editMode ? props.id : "Create Session");
  }

  return (
    <div
      className="pop-up-content"
      id={props.editMode ? editId : props.id + "-popup"}
    >
      <InputField
        class="session-name-input"
        label="Session Name"
        default={
          props.editMode ? props.session.name : new Date().toDateString()
        }
        input={`Default: ${new Date().toDateString()}`}
        onChange={(e) => setSessionName(e.target.value)}
        onKeyDown={handleKeyPresses}
      />
      {props.editMode ? null : (
        <Form.Check
          type="checkbox"
          id="location-checkbox"
          label="Require students to be in the same location"
          className="location-checkbox"
          style={{ paddingLeft: "2rem" }}
        />
      )}
      {props.editMode ? (
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
      ) : null}
      <div className="button-row">
        {props.editMode ? (
          <PrimaryButton
            variant="delete"
            label="Delete"
            onClick={() => props.setMarkDelete(true)}
          />
        ) : null}
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => clearContents()}
        />
        <PrimaryButton
          variant="primary"
          id={props.editMode ? "save-session" : "create-session"}
          label={props.editMode ? "Save" : "Create"}
          onClick={() => (props.editMode ? handleEdit() : createSession())}
        />
      </div>
    </div>
  );
}
