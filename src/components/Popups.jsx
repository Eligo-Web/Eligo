import React, { useEffect, useState } from "react";
import { IconButton, PrimaryButton, VoteButton } from "./Buttons.jsx";
import { closePopup } from "./Overlay";
import InputField from "./InputField";
import NewWindow from "react-new-window";
import axios from "axios";
import { IconTrash } from "@tabler/icons-react";

export function Default() {
  return (
    <div className="pop-up-content">
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
    <div className="pop-up-content">
      <InputField label={props.inputLabel} input={props.placeholder} />
      <div className="button-row">
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => closePopup(props.id)}
        />
        <PrimaryButton
          variant="primary"
          label={props.primary}
          onClick={() => {
            /**TODO */
            closePopup(props.id);
          }}
        />
      </div>
    </div>
  );
}

export function JoinClass() {
  return (
    <JoinOrCreate
      id="Join Class"
      primary="Join"
      inputLabel="Course Code"
      placeholder="ex: A1B2C3"
    />
  );
}

export function JoinSession(props) {
  return (
    <JoinOrCreate
      id="Join Session"
      primary="Join"
      inputLabel="Password"
      placeholder="Ex: •••••••"
    />
  );
}

export function CreateClass() {
  const server = "http://localhost:3000";
  let name = "";
  let section = "";
  function storeName(n) {
    name = n;
    console.log(name);
  }
  function storeSection(s) {
    section = s;
    console.log(section);
  }
  function postCourse() {
    axios
      .post(`${server}/course`, {
        name: name,
        section: section,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  return (
    <div className="pop-up-content">
      <div className="input-group">
        <InputField
          label="Class Name"
          input="ex: Intermediate Programming"
          onChange={(e) => storeName(e.target.value)}
        />
        <InputField
          class="section-input"
          label="Section"
          input="#"
          onChange={(e) => storeSection(e.target.value)}
        />
      </div>
      <div className="button-row">
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => closePopup("Create Class")}
        />
        <PrimaryButton variant="primary" label="Create" onClick={() => postCourse(name, section)} />
      </div>
    </div>
  );
}

export function EditClass(props) {
  return (
    <div className="pop-up-content">
      <div className="input-group">
        <InputField
          label="Class Name"
          input="ex: Intermediate Programming"
          value="Current name"
        />
        <InputField class="section-input" label="Section" input="#" value="1" />
      </div>
      <div className="button-row">
        <PrimaryButton
          variant="delete"
          label="Delete"
          onClick={() => closePopup("Edit Class")}
        />
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => closePopup("Edit Class")}
        />
        <PrimaryButton
          variant="primary"
          label="Save"
          onClick={() => closePopup("Edit Class")}
        />
      </div>
    </div>
  );
}

export function CreateSession() {
  return (
    <JoinOrCreate
      id="Create Session"
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

export function InstructorPoll(props) {
  return;
}
