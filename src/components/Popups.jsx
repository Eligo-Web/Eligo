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

export function ConfirmDelete(props) {
  return (
    <div className="delete-popup">
      <div className="error-banner">
        <IconAlertTriangleFilled />
        Confirm Delete? This action cannot be undone.
      </div>
      <div className="button-row-delete">
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={props.cancelClick}
        />
        <PrimaryButton
          variant="primary-red"
          label="Delete"
          onClick={props.deleteClick}
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
              name: props.name,
              permission: props.permission,
              email: props.email,
              sectionId: props.sectionId,
              sessionId: props.sessionId,
              session: props.session,
              sessionName: props.sessionName,
              weekNum: props.weekNum,
              courseName: props.courseName,
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

export function Poll(props) {
  const [selected, setSelected] = useState("");
  const server = "http://localhost:3000";
  const [voteButtons, setVoteButtons] = useState(null);

  useEffect(() => {
    setVoteButtons({
      A: document.getElementById("A-button"),
      B: document.getElementById("B-button"),
      C: document.getElementById("C-button"),
      D: document.getElementById("D-button"),
      E: document.getElementById("E-button"),
    });
  }, []);

  async function makeSelection(choice) {
    await axios
      .patch(
        `${server}/course/${props.sectionId}/${props.weekNum}/${props.sessionId}/${props.pollId}`,
        {
          email: props.email,
          timestamp: Date.now().toString(),
          response: choice,
        }
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });

    if (selected !== "") {
      voteButtons[selected].className = "card btn btn-vote";
    }
    setSelected(choice);
    voteButtons[choice].className += " btn-active";
  }

  return (
    <div className="vote-btn-container" id={props.pollId}>
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
