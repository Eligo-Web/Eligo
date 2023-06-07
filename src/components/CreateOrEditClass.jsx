// Eligo is a web application primarily used for in-class polls.
// Copyright (C) 2023  Eligo-Web <smodare1@jhu.edu> <ffernan9@jhu.edu>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { server } from "../ServerUrl";
import { EditPopupContext } from "../containers/InAppContainer";
import "../styles/newpoll.css";
import { PrimaryButton } from "./Buttons.jsx";
import InputField, { SelectField } from "./InputField";
import { FloatError } from "./Popups";
import pause, { closePopup } from "./Utils";

function toSectionId(name, section, semester) {
  const idStr = `${name}~${section}~${semester}`;
  return idStr.replace(/\s/g, "").toLowerCase();
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
      name={content.name}
      section={content.section}
      sisId={content.SISId}
      semester={content.semester}
      sectionId={content.sectionId}
      refresh={props.refresh}
      setRefresh={props.setRefresh}
      markDelete={props.markDelete}
      setMarkDelete={props.setMarkDelete}
      confirmDelete={props.confirmDelete}
      control={props.control}
      editMode
    />
  );
}

function CreateOrEditClass(props) {
  const [name, setName] = useState(props.name || "");
  const [section, setSection] = useState(props.section || "");
  const [sisId, setSISId] = useState(props.sisId || "");
  const [semester, setSemester] = useState(props.semester || "");
  const [showError, setShowError] = useState(false);
  const [refresh, setRefresh] = [props.refresh, props.setRefresh];
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useContext(EditPopupContext);
  const validCharset = /^[^~]*$/;
  const location = useLocation();
  const popupName = props.editMode
    ? toSectionId(props.name, props.section, props.semester)
    : "create-class";
  const [nameInputErr, setNameInputErr] = useState("");
  const [sisIDInputErr, setSisIDInputErr] = useState("");
  const [sectionInputErr, setSectionInputErr] = useState("");
  let valid = true;

  useEffect(() => {
    if (props.editMode) return;
    setSemester(document.querySelector(".semester-input").value);
  }, []);

  useEffect(() => {
    const overlay = document.getElementById(popupName);
    if (!overlay) return;
    const isOpen = !!overlay.parentNode.isOpen;
    if (isOpen && props.control) {
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
        handleSaveCreate();
        break;
    }
  };

  function handleDelete() {
    closePopup(popupName, setPopup);
    deleteCourse();
  }

  async function clearContents() {
    const overlay = document.getElementById(popupName);
    const nameField = overlay.querySelector(".name-input");
    const sectionField = overlay.querySelector(".section-input");
    const sisIdField = overlay.querySelector(".sis-id-input");
    const semesterField = overlay.querySelector(".semester-input");

    nameField.value = props.editMode ? props.name : "";
    sectionField.value = props.editMode ? props.section : "";
    sisIdField.value = props.editMode ? props.sisId : "";
    setName(nameField.value);
    setSection(sectionField.value);
    setSISId(sisIdField.value);
    if (props.editMode) {
      semesterField.value = props.semester;
      setSemester(semesterField.value);
    }

    setShowError(false);
    if (props.editMode && props.markDelete) {
      props.setMarkDelete(false);
      await pause(300);
    }
    nameField.className = "name-input form-control";
    sectionField.className = "section-input form-control";
    sisIdField.className = "sis-id-input form-control";
    nameField.parentNode.parentNode.className = "input-field";
    sectionField.parentNode.parentNode.className = "input-field-small";
    sisIdField.parentNode.parentNode.className = "input-field-small";
    setNameInputErr("");
    setSisIDInputErr("");
    setSectionInputErr("");
    await pause(100);
    closePopup(popupName, setPopup);
  }

  function paramsValid() {
    const overlay = document.getElementById(popupName);
    const nameField = overlay.querySelector(".name-input");
    const sectionField = overlay.querySelector(".section-input");
    const sisIdField = overlay.querySelector(".sis-id-input");
    valid = true;

    if (!name) {
      setNameInputErr("• Required field");
      nameField.parentNode.parentNode.className += " input-error";
      nameField.className += " field-error";
      valid = false;
    } else if (!validCharset.test(name)) {
      setNameInputErr("• Invalid characters: ~");
      nameField.parentNode.parentNode.className += " input-error";
      nameField.className += " field-error";
      valid = false;
    } else {
      setNameInputErr("");
      nameField.parentNode.parentNode.className = "input-field";
      nameField.className = "name-input form-control";
    }

    if (!section) {
      setSectionInputErr("• Required field");
      sectionField.parentNode.parentNode.className += " input-error";
      sectionField.className += " field-error";
      valid = false;
    } else if (isNaN(section) || section < 1) {
      setSectionInputErr("• Invalid section");
      sectionField.parentNode.parentNode.className += " input-error";
      sectionField.className += " field-error";
      valid = false;
    } else {
      setSectionInputErr("");
      sectionField.parentNode.parentNode.className = "input-field-small";
      sectionField.className = "section-input form-control";
    }

    if (sisId && !/^[A-Z]{2}\.\d{3}\.\d{3}$/.test(sisId)) {
      setSisIDInputErr("• Invalid format");
      sisIdField.parentNode.parentNode.className += " input-error";
      sisIdField.className += " field-error";
      valid = false;
    } else {
      setSisIDInputErr("");
      sisIdField.parentNode.parentNode.className = "input-field-small";
      sisIdField.className = "sis-id-input form-control";
    }
    return valid;
  }

  async function handleSaveCreate() {
    setSaving(true);
    props.editMode ? await putCourse() : await postCourse();
  }

  async function postCourse() {
    const container = document.querySelector(".semester-container");
    container.style.pointerEvents = "none";
    if (!paramsValid()) {
      container.style.pointerEvents = "all";
      setShowError(false);
      setSaving(false);
      return;
    }
    let response;
    await axios
      .post(`${server}/course`, {
        name: name,
        instructor: { email: location.state.email, name: location.state.name },
        section: section,
        semester: semester,
        SISId: sisId,
        passcode: Math.random().toString(36).slice(-8).toUpperCase(),
      })
      .then((res) => {
        response = res.data;
      });
    if (response.status === 409) {
      container.style.pointerEvents = "all";
      setShowError(true);
      setSaving(false);
      return;
    } else {
      setShowError(false);
    }
    await axios.put(`${server}/instructor/${location.state.email}`, {
      newCourse: name,
      newSection: section,
      newSemester: semester,
    });
    clearContents();
    setRefresh(!refresh);
  }

  async function putCourse() {
    const container = document.querySelector(".semester-container");
    container.style.pointerEvents = "none";
    if (!paramsValid()) {
      container.style.pointerEvents = "all";
      setShowError(false);
      setSaving(false);
      return;
    }

    if (
      name === props.name &&
      section === props.section &&
      sisId === props.sisId &&
      semester === props.semester
    ) {
      container.style.pointerEvents = "all";
      closePopup(popupName, setPopup);
      setSaving(false);
      return;
    }

    const oldSectionId = toSectionId(props.name, props.section, props.semester);
    const sectionId = toSectionId(name, section, semester);
    let checkDupe;
    let course;

    await axios.get(`${server}/course/${sectionId}`).then((res) => {
      checkDupe = res.data;
    });

    if (checkDupe.status === 200 && checkDupe.data.sectionId !== oldSectionId) {
      container.style.pointerEvents = "all";
      setShowError(true);
      setSaving(false);
      return;
    }

    await axios
      .put(`${server}/course/${oldSectionId}`, {
        name: name,
        section: section,
        semester: semester,
        SISId: sisId,
        sectionId: sectionId,
        email: location.state.email,
      })
      .then((res) => {
        course = res.data.data;
        if (res.data.status === 409) {
          setShowError(true);
        } else {
          setShowError(false);
        }
      });
    await axios.put(
      `${server}/instructor/${location.state.email}/${props.semester}/${oldSectionId}`,
      {
        newSectionId: sectionId,
        newSemester: semester,
      }
    );
    for (let student in course.students) {
      await axios.put(
        `${server}/student/${student}/${props.semester}/${oldSectionId}`,
        {
          newSectionId: sectionId,
          newSemester: semester,
          requester: location.state.email,
        }
      );
    }
    closePopup(popupName, setPopup);
    setRefresh(!refresh);
  }

  async function deleteCourse() {
    const container = document.querySelector(".semester-container");
    container.style.pointerEvents = "none";
    const oldSectionId = toSectionId(props.name, props.section, props.semester);
    let students = [];
    await axios.delete(`${server}/course/${oldSectionId}`).then((res) => {
      students = res.data.data.students;
    });
    await axios.delete(
      `${server}/instructor/${location.state.email}/${props.semester}/${oldSectionId}`
    );
    for (let student in students) {
      await axios.delete(
        `${server}/student/${student}/${props.semester}/${oldSectionId}`
      );
    }
    setRefresh(!refresh);
  }

  return (
    <div
      className="pop-up-content course-width"
      id={popupName}
      onKeyDown={handleKeyPresses}
    >
      <div className="input-group">
        <InputField
          class="name-input"
          label="Class Name"
          input="ex: Intermediate Programming"
          default={props.name || ""}
          onChange={(e) => setName(e.target.value)}
          errorState={nameInputErr}
        />
        <InputField
          small
          class="sis-id-input"
          label="Course ID (opt.)"
          input="ex: AB.123.456"
          default={props.sisId || ""}
          onChange={(e) => setSISId(e.target.value.toUpperCase())}
          style={{ textTransform: "uppercase" }}
          errorState={sisIDInputErr}
        />
      </div>
      <div className="input-group">
        <InputField
          small
          class="section-input"
          label="Section No."
          input="1, 2, ..."
          default={props.section || ""}
          onChange={(e) => setSection(e.target.value)}
          errorState={sectionInputErr}
        />
        <SelectField
          class="semester-input"
          label="Semester"
          input="ex: Spring 2023"
          default={props.semester}
          onChange={(e) => setSemester(e.target.value)}
        />
      </div>
      <FloatError msg={showError && "Warning: This course already exists!"} />
      <div className="button-row">
        {props.editMode && (
          <PrimaryButton
            id={"delete-" + props.sectionId}
            variant="delete"
            label="Delete"
            onClick={() => props.setMarkDelete(true)}
          />
        )}
        <PrimaryButton
          id={"discard-edit-" + props.sectionId}
          variant="secondary"
          label="Discard"
          onClick={() => clearContents()}
        />
        <PrimaryButton
          id={"save-" + props.sectionId}
          variant="primary"
          label={props.editMode ? "Save" : "Create"}
          onClick={handleSaveCreate}
          style={{ minHeight: "100%" }}
          loading={saving}
        />
      </div>
    </div>
  );
}
