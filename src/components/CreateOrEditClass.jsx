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

export function CreateClass(props) {
  return (
    <CreateOrEditClass
      popupType="Create Class"
      refresh={props.refresh}
      setRefresh={props.setRefresh}
      control={props.control}
    />
  );
}

export function EditClass(props) {
  const content = props.childContent;
  return (
    <CreateOrEditClass
      popupType="Edit Class"
      name={content.name} //     from axios get
      section={content.section} //  from axios get
      sisId={content.SISId} //    from axios get
      semester={content.semester} // from axios get
      editMode
      refresh={props.refresh}
      setRefresh={props.setRefresh}
      control={props.control}
    />
  );
}

function pause() {
  return new Promise((res) => setTimeout(res, 250));
}

function CreateOrEditClass(props) {
  const server = "http://localhost:3000";
  const [name, setName] = useState(props.name || "");
  const [section, setSection] = useState(props.section || "");
  const [sisId, setSISId] = useState(props.sisId || "");
  const [semester, setSemester] = useState(props.semester || "");
  const [showError, setShowError] = useState(false);
  const validCharset = /^[ -~]+$/;
  const location = useLocation();
  const [refresh, setRefresh] = [props.refresh, props.setRefresh];
  const popupName = props.editMode
    ? toSectionId(props.name + props.section + props.semester)
    : "Create Class";
  let valid = true;

  useEffect(() => {
    if (props.editMode) return;
    setSemester(document.querySelector(".semester-input").value);
  }, []);

  useEffect(() => {
    const overlay = document.getElementById(popupName);
    if (overlay.offsetParent.style.height) {
      clearContents(props.editMode);
    }
  }, [props.control]);

  const handleKeyPresses = (event) => {
    switch (event.key) {
      case "Escape":
        clearContents(props.editMode);
        break;
      case "Enter":
        props.editMode ? putCourse() : postCourse();
        break;
    }
  };

  function clearContents(editMode) {
    const overlay = document.getElementById(popupName);
    const nameField = overlay.querySelector(".name-input");
    const sectionField = overlay.querySelector(".section-input");
    const sisIdField = overlay.querySelector(".sis-id-input");
    const semesterField = overlay.querySelector(".semester-input");

    nameField.value = editMode ? props.name : "";
    sectionField.value = editMode ? props.section : "";
    sisIdField.value = editMode ? props.sisId : "";
    setName(nameField.value);
    setSection(sectionField.value);
    setSISId(sisIdField.value);
    if (editMode) {
      semesterField.value = props.semester;
      setSemester(semesterField.value);
    }

    setShowError(false);
    nameField.className = "name-input form-control";
    sectionField.className = "section-input form-control";
    sisIdField.className = "sis-id-input form-control";
    overlay.querySelector(".empty-name").style.display = "none";
    overlay.querySelector(".invalid-name").style.display = "none";
    overlay.querySelector(".empty-section").style.display = "none";
    overlay.querySelector(".invalid-section").style.display = "none";
    overlay.querySelector(".invalid-sis-id").style.display = "none";
    closePopup(popupName);
  }

  function paramsValid() {
    const overlay = document.getElementById(popupName);
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
      sectionField.className = "section-input form-control";
      overlay.querySelector(".empty-section").style.display = "none";
      overlay.querySelector(".invalid-section").style.display = "none";
    }

    if (sisId && !/^[a-zA-Z]{2}\.\d{3}\.\d{3}$/.test(sisId)) {
      sisIdField.className += " field-error";
      overlay.querySelector(".invalid-sis-id").style.display = "block";
      valid = false;
    } else {
      sisIdField.className = "sis-id-input form-control";
      overlay.querySelector(".invalid-sis-id").style.display = "none";
    }
    return valid;
  }

  async function postCourse() {
    if (!paramsValid()) {
      console.log("some fields invalid!");
      setShowError(false);
      return;
    }
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
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });
    closePopup(popupName);
    await pause();
    setRefresh(!refresh);
  }

  async function putCourse() {
    if (!paramsValid()) {
      console.log("some fields invalid!");
      setShowError(false);
      return;
    }
    console.log("valid");

    if (
      (name === props.name,
      section === props.section,
      sisId === props.sisId,
      semester === props.semester)
    ) {
      clearContents(props.editMode);
      return;
    }

    const oldSectionId = toSectionId(
      props.name + props.section + props.semester
    );
    const sectionId = toSectionId(name + section + semester);
    let checkDupe;

    await axios
      .get(`${server}/course/${sectionId}`)
      .then((res) => {
        checkDupe = res.data;
      })
      .catch((err) => console.log(err));

    if (checkDupe.status === 200) {
      setShowError(true);
      return;
    }

    await axios
      .put(`${server}/course/${oldSectionId}`, {
        name: name,
        section: section,
        semester: semester,
        SISId: sisId,
        sectionId: sectionId,
      })
      .then((res) => {
        console.log(res);
        if (res.data.status === 409) {
          setShowError(true);
        } else {
          setShowError(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    await axios
      .put(
        `${server}/instructor/${location.state.email}/${props.semester}/${oldSectionId}`,
        {
          newSectionId: sectionId,
          newSemester: semester,
        }
      )
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });
    closePopup(popupName);
    await pause();
    setRefresh(!refresh);
  }

  async function deleteCourse() {
    const sectionId = toSectionId(name + section + semester);
    await axios
      .delete(`${server}/course/${sectionId}`)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    await axios
      .delete(
        `${server}/instructor/${location.state.email}/${semester}/${sectionId}`
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    closePopup(popupName);
    await pause();
    setRefresh(!refresh);
  }

  return (
    <div className="pop-up-content" id={popupName}>
      <div className="input-group">
        <InputField
          class="name-input"
          label="Class Name"
          input="ex: Intermediate Programming"
          default={props.name || ""}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyPresses}
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
          onKeyDown={handleKeyPresses}
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
          onKeyDown={handleKeyPresses}
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
          onKeyDown={handleKeyPresses}
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
            onClick={() => deleteCourse()}
          />
        ) : null}
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => clearContents(props.editMode)}
        />
        <PrimaryButton
          id={popupName}
          variant="primary"
          label={props.editMode ? "Save" : "Create"}
          onClick={() => (props.editMode ? putCourse() : postCourse())}
        />
      </div>
    </div>
  );
}
