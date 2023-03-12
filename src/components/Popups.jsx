import React, { useEffect, useState } from "react";
import { PrimaryButton, VoteButton } from "./Buttons.jsx";
import { closePopup } from "./Overlay";
import InputField, { SelectField } from "./InputField";
import { genSaltSync, hashSync } from "bcryptjs-react";
import axios from "axios";
import "../styles/newpoll.css";
import Course from "../model/Course.js";

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
            /**TODO */
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

export function CreateClass() {
  const server = "http://localhost:3000";
  const today = new Date();
  const defaultSemester =
    (today.getMonth() < 7 ? "Spring " : "Fall ") + today.getFullYear();
  let name = "";
  let section = "";
  let semester = defaultSemester;
  const validCharset = /^[ -~]+$/;
  let valid = true;

  function clearContents() {
    const overlay = document.getElementById("create-class-popup");
    const nameField = overlay.querySelector(".name-input");
    const sectionField = overlay.querySelector(".section-input");
    name = "";
    section = "";
    nameField.value = "";
    nameField.placeholder = "ex: Intermediate Programming";
    nameField.className = "name-input form-control";
    sectionField.value = "";
    sectionField.placeholder = "1, 2, ...";
    sectionField.className = "section-input form-control";
    closePopup("Create Class");
  }

  function paramsValid() {
    const overlay = document.getElementById("create-class-popup");
    const nameField = overlay.querySelector(".name-input");
    const sectionField = overlay.querySelector(".section-input");

    if (!name) {
      nameField.className += " field-error";
      nameField.placeholder = "* Required";
      valid = false;
    } else if (!validCharset.test(name + section + semester)) {
      nameField.className += " field-error";
      nameField.value = "";
      nameField.placeholder = "* Contains invalid characters";
      valid = false;
    } else {
      nameField.placeholder = "ex: Intermediate Programming";
      nameField.className = "name-input form-control";
    }

    if (!section) {
      sectionField.className += " field-error";
      sectionField.placeholder = "* Required";
      valid = false;
    } else if (isNaN(section)) {
      sectionField.placeholder = "* Invalid";
      sectionField.value = "";
      sectionField.className += " field-error";
      valid = false;
    } else {
      sectionField.placeholder = "1, 2, ...";
      sectionField.className = "section-input form-control";
    }
    return valid;
  }

  function postCourse() {
    if (!paramsValid()) {
      console.log("some fields invalid!");
      return;
    }
    let sectionId = name + section + semester;
    sectionId = sectionId.replace(/\s/g, "").toLowerCase();
    console.log("valid");
    axios
      .post(`${server}/course`, {
        name: name,
        section: section,
        semester: semester,
        sectionId: sectionId,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
      closePopup("Create Class");
  }

  return (
    <div className="pop-up-content" id="create-class-popup">
      <div className="input-group">
        <InputField
          class="name-input"
          label="Class Name"
          input="ex: Intermediate Programming"
          onChange={(e) => (name = e.target.value)}
        />
      </div>
      <div className="input-group">
        <InputField
          section
          class="section-input"
          label="Section No."
          input="1, 2, ..."
          onChange={(e) => (section = e.target.value)}
        />
        <SelectField
          class="semester-input"
          label="Semester"
          input="ex: Spring 2023"
          default={defaultSemester}
          onChange={(e) => (semester = e.target.value)}
        />
      </div>
      <div className="button-row">
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => clearContents()}
        />
        <PrimaryButton
          variant="primary"
          label="Create"
          onClick={() => postCourse()}
        />
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
          default="Current name"
        />
        <InputField
          class="section-input"
          label="Section"
          input="#"
          default="1"
        />
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
