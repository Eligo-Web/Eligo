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

function JoinOrCreate(props) {
  console.log(props);
  return (
    <div className="pop-up-content" id={props.id}>
      <InputField
        label={props.inputLabel}
        input={props.placeholder}
        type={props.type}
      />
      <div className="button-row">
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => closePopup(props.popupId)}
        />
        <PrimaryButton
          variant="primary"
          label={props.primary}
          onClick={() => {
            //todo: add axios call to join 
            closePopup(props.popupId);
          }}
        />
      </div>
    </div>
  );
}

export function JoinClass() {
  return (
    <JoinOrCreate
      id="join-class-popup"
      popupId="Join Class"
      primary="Join"
      inputLabel="Course Code"
      placeholder="ex: A1B2C3"
    />
  );
}

export function JoinSession() {
  return (
    <JoinOrCreate
      id="join-session-popup"
      popupId="Join Session"
      primary="Join"
      inputLabel="Passcode"
      placeholder="Ex: abc123"
      type="password"
    />
  );
}

export function CreateSession() {
  return (
    <JoinOrCreate
      id="create-session-popup"
      popupId="Create Session"
      primary="Create"
      inputLabel="Session Name"
      placeholder="ex: March 14 11AM class"
    />
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
