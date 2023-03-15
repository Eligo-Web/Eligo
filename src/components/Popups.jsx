import React, { useEffect, useState } from "react";
import { PrimaryButton, VoteButton } from "./Buttons.jsx";
import { closePopup } from "./Overlay";
import InputField from "./InputField";
import axios from "axios";
import "../styles/newpoll.css";

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

async function joinClass(email, passcode, refresh, setRefresh) {
  const server = "http://localhost:3000";
  await axios
    .get(`${server}/course/student/${passcode}`)
    .then(async (res) => {
      if (res.data.status === 200) {
        await axios
          .put(`${server}/student/${email}`, {
            sectionId: res.data.data.sectionId,
            semester: res.data.data.semester,
          })
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            console.log(err);
          });
        await axios
          .put(`${server}/course/${res.data.data.sectionId}/${email}`)
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
  setRefresh(!refresh);
  closePopup("Join Class");
}

export function JoinClass(props) {
  const [passcode, setPasscode] = useState("");
  return (
    <div className="pop-up-content" id="join-class-popup">
      <InputField
        label="Course Code"
        input="ex: A1B2C3"
        onChange={(e) => setPasscode(e.target.value)}
      />
      <div className="button-row">
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => closePopup("Join Class")}
        />
        <PrimaryButton
          variant="primary"
          label="Join"
          onClick={() => {
            joinClass(props.email, passcode, props.refresh, props.setRefresh);
          }}
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
