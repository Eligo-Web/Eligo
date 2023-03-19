import React, { useEffect, useState } from "react";
import { PrimaryButton, VoteButton } from "./Buttons.jsx";
import { closePopup } from "./Overlay";
import InputField from "./InputField";
import axios from "axios";
import "../styles/newpoll.css";
import { IconAlertTriangleFilled } from "@tabler/icons-react";

export function Default() {
  return (
    <div className="pop-up-content" id="default-popup">
      <InputField />
      <div className="button-row">
        <PrimaryButton variant="secondary" label="Cancel" />
        <PrimaryButton variant="primary" label="Submit" />
      </div>
    </div>
  );
}

export function CreateSession(props) {
  function getWeekNumber() {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const yrProgress = (currentDate - startDate) / (24 * 60 * 60 * 1000);
    const currWeekNum = Math.ceil(yrProgress / 7);
    return `${currentDate.getFullYear()}-${currWeekNum}`;
  }

  async function createSession() {
    const sessionId = `session-${Date.now()}`;
    const weekNum = getWeekNumber();

    const server = "http://localhost:3000";
    await axios
      .get(`${server}/course/${props.sectionId}`)
      .then((res) => {
        checkDupe = res.data;
      })
      .catch((err) => console.log(err));

    if (checkDupe.status === 200 && sisId === props.sisId) {
      setShowError(true);
      return;
    }
  }

  return (
    <div className="pop-up-content" id="create-session-popup">
      <InputField label="Session Name" input="ex: March 14 11AM class" />
      <div className="button-row">
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => closePopup("Create Session")}
        />
        <PrimaryButton
          variant="primary"
          label="Create"
          onClick={() => {
            //todo: add axios call to join
            closePopup("Create Session");
          }}
        />
      </div>
    </div>
  );
}

export function JoinSession(props) {
  return (
    <div className="pop-up-content" id="join-session-popup">
      <InputField label="Passcode" input="Ex: abc123" type="password" />
      <div className="button-row">
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => closePopup("Join Session")}
        />
        <PrimaryButton
          variant="primary"
          label="Join"
          onClick={() => {
            //todo: add axios call to join
            closePopup("Join Session");
          }}
        />
      </div>
    </div>
  );
}

export function JoinClass(props) {
  const [passcode, setPasscode] = useState("");
  const [dupeError, setDupeError] = useState(false);
  const [invalidError, setInvalidError] = useState(false);
  let valid = true;

  useEffect(() => {
    const overlay = document.getElementById("join-class-popup");
    console.log(overlay);
    if (overlay.offsetParent.style.height) {
      clearContents();
      console.log("clear contents");
    }
  }, [props.control]);

  function checkPasscode() {
    const overlay = document.getElementById("join-class-popup");
    const passcodeField = overlay.querySelector(".passcode-input");
    valid = true;

    if (!passcode) {
      passcodeField.className += " field-error";
      overlay.querySelector(".empty-code").style.display = "block";
      valid = false;
    } else {
      passcodeField.className = "passcode-input form-control";
      overlay.querySelector(".empty-code").style.display = "none";
    }
    return valid;
  }

  function clearContents() {
    const overlay = document.getElementById("join-class-popup");
    const passcodeField = overlay.querySelector(".passcode-input");
    passcodeField.className = "passcode-input form-control";
    overlay.querySelector(".empty-code").style.display = "none";
    passcodeField.value = "";
    setInvalidError(false);
    setDupeError(false);
    setPasscode("");
    closePopup("Join Class");
  }

  async function joinClass() {
    if (!checkPasscode()) {
      console.log("passcode invalid!");
      setDupeError(false);
      return;
    }
    const server = "http://localhost:3000";
    await axios
      .get(`${server}/course/student/${passcode.toUpperCase()}`)
      .then(async (res) => {
        console.log(res);
        if (res.data.status === 404) {
          setDupeError(false);
          setInvalidError(true);
          return;
        }
        if (res.data.status === 200) {
          const sectionId = res.data.data.sectionId;
          const semester = res.data.data.semester;
          await axios
            .put(`${server}/student/${props.email}`, {
              sectionId: sectionId,
              semester: semester,
            })
            .then((res) => {
              if (res.data.status === 404) {
                setInvalidError(false);
                setDupeError(true);
                return;
              }
              props.setRefresh(!props.refresh);
              clearContents();
            })
            .catch((err) => {
              console.log(err);
            });
          await axios
            .put(`${server}/course/${res.data.data.sectionId}/${props.email}`, {
              name: props.name,
            })
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="pop-up-content" id="join-class-popup">
      <InputField
        class="passcode-input"
        label="Course Code"
        input="ex: A1B2C3"
        onChange={(e) => setPasscode(e.target.value)}
        errors={{ "empty-code": "Required" }}
        style={{ textTransform: "uppercase" }}
      />
      <div
        className="error-banner"
        style={{ display: dupeError ? "flex" : "none" }}
      >
        <IconAlertTriangleFilled />
        You have already joined this course!
      </div>
      <div
        className="error-banner"
        style={{ display: invalidError ? "flex" : "none" }}
      >
        <IconAlertTriangleFilled />
        Course with given passcode not found!
      </div>
      <div className="button-row">
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => clearContents()}
        />
        <PrimaryButton
          variant="primary"
          label="Join"
          onClick={() => joinClass()}
        />
      </div>
    </div>
  );
}

export function Poll(id) {
  const [selected, setSelected] = useState("");

  function makeSelection(choice) {
    if (selected === choice) {
      return;
    }
    if (selected !== "") {
      document.getElementById(selected).className = "card btn btn-vote";
    }
    setSelected(choice);
    document.getElementById(choice).className += " btn-active";
  }

  return (
    <div className="vote-btn-container" id={id}>
      <VoteButton
        label="A"
        onClick={() => makeSelection("A")}
        pressed={selected === "A"}
      />
      <VoteButton
        label="B"
        onClick={() => makeSelection("B")}
        pressed={selected === "B"}
      />
      <VoteButton
        label="C"
        onClick={() => makeSelection("C")}
        pressed={selected === "C"}
      />
      <VoteButton
        label="D"
        onClick={() => makeSelection("D")}
        pressed={selected === "D"}
      />
      <VoteButton
        label="E"
        onClick={() => makeSelection("E")}
        pressed={selected === "E"}
      />
    </div>
  );
}
