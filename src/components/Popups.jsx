import React, { useEffect, useState } from "react";
import { PrimaryButton, VoteButton } from "./Buttons.jsx";
import { closePopup } from "./Overlay";
import { useNavigate } from "react-router-dom";
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
  const [sessionName, setSessionName] = useState("");

  useEffect(() => {
    const overlay = document.getElementById("create-session-popup");
    if (overlay.offsetParent.style.height) {
      clearContents();
    }
  }, [props.control]);

  const handleKeyPresses = (event) => {
    switch (event.key) {
      case "Escape":
        clearContents();
        break;
      case "Enter":
        createSession();
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
    await axios
      .put(`${server}/course/${props.sectionId}/${getWeekNumber()}/closeAll`)
      .then((res) => {
        console.log(res.data.data);
      })
      .catch((err) => console.log(err));
    await axios
      .post(`${server}/course/${props.sectionId}/${sessionId}`, {
        name: sessionName ? sessionName : new Date().toDateString(),
        passcode: Math.random().toString(10).slice(-4),
        weekNum: getWeekNumber(),
      })
      .then((res) => {
        console.log(res.data.data);
      })
      .catch((err) => console.log(err));
    props.setRefresh(!props.refresh);
    clearContents();
  }

  function clearContents() {
    const overlay = document.getElementById("create-session-popup");
    const nameField = overlay.querySelector(".session-name-input");
    nameField.value = "";
    setSessionName("");
    closePopup("Create Session");
  }

  return (
    <div className="pop-up-content" id="create-session-popup">
      <InputField
        class="session-name-input"
        label="Session Name"
        input={`Default: ${new Date().toDateString()}`}
        onChange={(e) => setSessionName(e.target.value)}
        onKeyDown={handleKeyPresses}
      />
      <div className="button-row">
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => closePopup("Create Session")}
        />
        <PrimaryButton
          variant="primary"
          label="Create"
          onClick={() => createSession()}
        />
      </div>
    </div>
  );
}

export function JoinSession(props) {
  const [passcode, setPasscode] = useState("");
  const [invalidErr, setInvalidErr] = useState(false);
  const navigate = useNavigate();
  const control = props.control;
  props = props.childProps;

  const handleKeyPresses = (event) => {
    switch (event.key) {
      case "Escape":
        clearContents();
        break;
      case "Enter":
        joinSession();
        break;
    }
  };

  useEffect(() => {
    const overlay = document.getElementById("join-session-popup");
    if (overlay.offsetParent.style.height) {
      clearContents();
    }
  }, [control]);

  function clearContents() {
    const overlay = document.getElementById("join-session-popup");
    const passcodeField = overlay.querySelector(".passcode-input");
    passcodeField.value = "";
    setPasscode("");
    setInvalidErr(false);
  }

  async function joinSession() {
    const server = "http://localhost:3000";
    if (!passcode) {
      setInvalidErr(true);
      return;
    }
    let valid = true;
    await axios
      .post(
        `${server}/course/${props.sectionId}/${props.weekNum}/${props.sessionId}/${props.email}/${passcode}`
      )
      .then((res) => {
        console.log(res.data);
        if (res.data.status === 200) {
          setInvalidErr(false);
          clearContents();
          navigate("/session", {
            state: {
              sectionId: props.sectionId,
              sessionId: props.sessionId,
              permission: "STUDENT",
              email: props.email,
            },
          });
        } else if (res.data.status === 401) {
          setInvalidErr(true);
          valid = false;
        }
      })
      .catch((err) => console.log(err));
      if (valid) closePopup("Join Session");
  }

  return (
    <div className="pop-up-content" id="join-session-popup">
      <InputField
        class="passcode-input"
        label="Passcode"
        input="Ex: 1234"
        onChange={(e) => {
          setPasscode(e.target.value);
        }}
        onKeyDown={handleKeyPresses}
        type="password"
      />
      <div
        className="error-banner"
        style={{ display: invalidErr ? "flex" : "none" }}
      >
        <IconAlertTriangleFilled />
        Failed to join session. Passcode is invalid!
      </div>
      <div className="button-row">
        <PrimaryButton
          variant="primary"
          label="Join"
          onClick={() => joinSession()}
        />
      </div>
    </div>
  );
}

export function JoinClass(props) {
  const [passcode, setPasscode] = useState("");
  const [dupeError, setDupeError] = useState(false);
  const [invalidError, setInvalidError] = useState(false);

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
    let valid = true;

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
