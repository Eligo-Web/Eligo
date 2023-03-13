import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PrimaryButton } from "./Buttons.jsx";
import { closePopup } from "./Overlay";
import { IconAlertTriangleFilled } from "@tabler/icons-react";
import InputField, { SelectField } from "./InputField";
import axios from "axios";
import "../styles/newpoll.css";

export function toSectionId(str) {
  return str.replace(/\s/g, "").toLowerCase();
}

export function CreateClass() {
  return <CreateOrEditClass popupType="Create Class" />;
}

export function EditClass(sectionId) {
  const server = "http://localhost:3000";
  let content;
  async function populateFields() {
    await axios.get(`${server}/course/${sectionId}`).then((res) => {
      const course = res.data.data;
    }).catch((err) => console.log(err));
  }
  populateFields();
  return (
    <CreateOrEditClass
      popupType="Edit Class"
      name="TestClass" //     from axios get
      section="1" //  from axios get
      sisId="EN.601.229" //    from axios get
      semester="Spring 2023" // from axios get
      editMode
    />
  );
}

function CreateOrEditClass(props) {
  const server = "http://localhost:3000";
  const [name, setName] = useState(props.name || "");
  const [section, setSection] = useState(props.section || "");
  const [sisId, setSISId] = useState(props.sisId || "");
  const [semester, setSemester] = useState(props.semester || "");
  const [showError, setShowError] = useState(false);
  const validCharset = /^[ -~]+$/;
  const popupType = props.editMode ? "Edit Class" : "Create Class";
  const popupId = props.editMode ? "edit-class-popup" : "create-class-popup";
  let valid = true;
  const location = useLocation();

  useEffect(() => {
    if (props.editMode) return;
    setSemester(document.querySelector(".semester-input").value);
  });

  function clearContents(reset) {
    const overlay = document.getElementById(popupId);
    const nameField = overlay.querySelector(".name-input");
    const sectionField = overlay.querySelector(".section-input");
    const sisIdField = overlay.querySelector(".sis-id-input");
    const semesterField = overlay.querySelector(".semester-input");

    nameField.value = reset ? props.name : "";
    sectionField.value = reset ? props.section : "";
    sisIdField.value = reset ? props.sisId : "";
    setName(nameField.value);
    setSection(sectionField.value);
    setSISId(sisIdField.value);
    if (reset) {
      semesterField.value = props.semester;
      setSemester(semesterField.value);
    }

    nameField.className = "name-input form-control";
    sectionField.className = "section-input form-control";
    sisIdField.className = "sis-id-input form-control";
    overlay.querySelector(".empty-name").style.display = "none";
    overlay.querySelector(".invalid-name").style.display = "none";
    overlay.querySelector(".empty-section").style.display = "none";
    overlay.querySelector(".invalid-section").style.display = "none";
    overlay.querySelector(".invalid-sis-id").style.display = "none";
    setShowError(false);
    closePopup(popupType);
  }

  function paramsValid() {
    console.log("checking:", name, section, semester, sisId);
    const overlay = document.getElementById(popupId);
    const nameField = overlay.querySelector(".name-input");
    const sectionField = overlay.querySelector(".section-input");
    const sisIdField = overlay.querySelector(".sis-id-input");
    valid = true;

    if (!name) {
      nameField.className += " field-error";
      overlay.querySelector(".empty-name").style.display = "block";
      overlay.querySelector(".invalid-name").style.display = "none";
      valid = false;
    } else if (!validCharset.test(name + section + semester)) {
      nameField.className += " field-error";
      overlay.querySelector(".empty-name").style.display = "none";
      overlay.querySelector(".invalid-name").style.display = "block";
      valid = false;
    } else {
      nameField.className = "name-input form-control";
      overlay.querySelector(".empty-name").style.display = "none";
      overlay.querySelector(".invalid-name").style.display = "none";
    }

    if (!section) {
      sectionField.className += " field-error";
      overlay.querySelector(".empty-section").style.display = "block";
      overlay.querySelector(".invalid-section").style.display = "none";
      valid = false;
    } else if (isNaN(section)) {
      overlay.querySelector(".empty-section").style.display = "none";
      overlay.querySelector(".invalid-section").style.display = "block";
      sectionField.className += " field-error";
      valid = false;
    } else {
      overlay.querySelector(".empty-section").style.display = "none";
      overlay.querySelector(".invalid-section").style.display = "none";
      sectionField.className = "section-input form-control";
    }

    if (sisId && !/^[a-zA-Z]{2}\.\d{3}\.\d{3}$/.test(sisId)) {
      sisIdField.className += " field-error";
      overlay.querySelector(".invalid-sis-id").style.display = "block";
      valid = false;
    } else {
      overlay.querySelector(".invalid-sis-id").style.display = "none";
      sisIdField.className = "sis-id-input form-control";
    }
    return valid;
  }

  async function postCourse() {
    if (!paramsValid()) {
      console.log("some fields invalid!");
      setShowError(false);
      return;
    }
    console.log("valid");
    await axios
      .post(`${server}/course`, {
        name: name,
        section: section,
        semester: semester,
        SISId: sisId,
      })
      .then((res) => {
        console.log(res);
        if (res.data.status === 409) {
          setShowError(true);
        } else {
          setShowError(false);
          clearContents();
        }
      })
      .catch((err) => {
        console.log(err);
      });
    await axios
      .put(`${server}/instructor/${location.state.email}`, {
        newCourse: name,
        newSection: section,
        newSemester: semester,
      })
      .then((res) => {
      })
      .catch((err) => {
        console.log(err);
      });
    window.location.reload();
  }

  async function putCourse() {
    if (!paramsValid()) {
      console.log("some fields invalid!");
      setShowError(false);
      return;
    }
    console.log("valid");
    await axios
      .put(`${server}/course`, {
        name: name,
        section: section,
        semester: semester,
        SISId: sisId,
      })
      .then((res) => {
        console.log(res);
        if (res.data.status === 409) {
          setShowError(true);
        } else {
          setShowError(false);
          clearContents(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="pop-up-content" id={popupId}>
      <div className="input-group">
        <InputField
          class="name-input"
          label="Class Name"
          input="ex: Intermediate Programming"
          default={props.name || ""}
          onChange={(e) => setName(e.target.value)}
          errors={{
            "empty-name": "Required",
            "invalid-name": "Name contains invalid characters",
          }}
        />
        <InputField
          section
          class="sis-id-input"
          label="Course ID (opt.)"
          input="ex: EN.601.220"
          default={props.sisId || ""}
          onChange={(e) => setSISId(e.target.value.toUpperCase())}
          errors={{ "invalid-sis-id": "Invalid format" }}
        />
      </div>
      <div className="input-group">
        <InputField
          section
          class="section-input"
          label="Section No."
          input="1, 2, ..."
          default={props.section || ""}
          onChange={(e) => setSection(e.target.value)}
          errors={{
            "empty-section": "Required",
            "invalid-section": "Invalid number",
          }}
        />
        <SelectField
          class="semester-input"
          label="Semester"
          input="ex: Spring 2023"
          default={props.semester}
          onChange={(e) => setSemester(e.target.value)}
        />
      </div>
      <div
        className="error-banner"
        style={{ height: showError ? "fit-content" : 0 }}
      >
        <IconAlertTriangleFilled />
        Warning: This course already exists!
      </div>
      <div className="button-row">
        {props.editMode ? (
          <PrimaryButton
            variant="delete"
            label="Delete"
            onClick={() => closePopup("Edit Class")}
          />
        ) : null}
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => clearContents(props.editMode)}
        />
        <PrimaryButton
          variant="primary"
          label={props.editMode ? "Save" : "Create"}
          onClick={() => (props.editMode ? putCourse() : postCourse())}
        />
      </div>
    </div>
  );
}
