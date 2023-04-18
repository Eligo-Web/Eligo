import { IconAlertTriangleFilled } from "@tabler/icons-react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { server } from "../ServerUrl";
import { EditPopupContext } from "../containers/InAppContainer";
import "../styles/newpoll.css";
import { PrimaryButton } from "./Buttons.jsx";
import InputField, { SelectField } from "./InputField";
import { closePopup } from "./Overlay";
import { pause } from "../pages/CourseView";

function toSectionId(str) {
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
      name={content.name} //         from axios get
      section={content.section} //   from axios get
      sisId={content.SISId} //       from axios get
      semester={content.semester} // from axios get
      sectionId={content.sectionId}
      refresh={props.refresh}
      setRefresh={props.setRefresh}
      markDelete={props.markDelete}
      setMarkDelete={props.setMarkDelete}
      confirmDelete={props.confirmDelete}
      control={props.control}
      overrideInit={props.overrideInit}
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
  const [popup, setPopup] = useContext(EditPopupContext);
  const validCharset = /^[ -~]+$/;
  const location = useLocation();
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
    if (!overlay) return;
    const isOpen = !!overlay.offsetParent.style.maxHeight;
    if (isOpen && (!props.overrideInit || props.control)) {
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
        props.editMode ? putCourse() : postCourse();
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
    overlay.querySelector(".empty-name").style.display = "none";
    overlay.querySelector(".invalid-name").style.display = "none";
    overlay.querySelector(".empty-section").style.display = "none";
    overlay.querySelector(".invalid-section").style.display = "none";
    overlay.querySelector(".invalid-sis-id").style.display = "none";
    closePopup(popupName, setPopup);
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
    } else if (isNaN(section) || section < 1) {
      overlay.querySelector(".empty-section").style.display = "none";
      overlay.querySelector(".invalid-section").style.display = "block";
      sectionField.className += " field-error";
      valid = false;
    } else {
      sectionField.className = "section-input form-control";
      overlay.querySelector(".empty-section").style.display = "none";
      overlay.querySelector(".invalid-section").style.display = "none";
    }

    if (sisId && !/^[A-Z]{2}\.\d{3}\.\d{3}$/.test(sisId)) {
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
      setShowError(false);
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
      setShowError(true);
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
    if (!paramsValid()) {
      setShowError(false);
      return;
    }

    if (
      name === props.name &&
      section === props.section &&
      sisId === props.sisId &&
      semester === props.semester
    ) {
      clearContents();
      return;
    }

    const oldSectionId = toSectionId(
      props.name + props.section + props.semester
    );
    const sectionId = toSectionId(name + section + semester);
    let checkDupe;
    let course;

    await axios.get(`${server}/course/${sectionId}`).then((res) => {
      checkDupe = res.data;
    });

    if (checkDupe.status === 200 && sisId === props.sisId) {
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
        }
      );
    }
    closePopup(popupName, setPopup);
    setRefresh(!refresh);
  }

  async function deleteCourse() {
    const oldSectionId = toSectionId(
      props.name + props.section + props.semester
    );
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
    closePopup(popupName, setPopup);
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
          small
          class="sis-id-input"
          label="Course ID (opt.)"
          input="ex: EN.601.220"
          default={props.sisId || ""}
          onChange={(e) => setSISId(e.target.value.toUpperCase())}
          onKeyDown={handleKeyPresses}
          errors={{ "invalid-sis-id": "Invalid format" }}
          style={{ textTransform: "uppercase" }}
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
          onKeyDown={handleKeyPresses}
          errors={{
            "empty-section": "Required",
            "invalid-section": "Invalid section",
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
        style={{ display: showError ? "flex" : "none" }}
      >
        <IconAlertTriangleFilled />
        Warning: This course already exists!
      </div>
      <div className="button-row">
        {props.editMode ? (
          <PrimaryButton
            id={"delete-" + props.sectionId}
            variant="delete"
            label="Delete"
            onClick={() => props.setMarkDelete(true)}
          />
        ) : null}
        <PrimaryButton
          id={"discard-edit-" + props.sectionId}
          variant="secondary"
          label="Discard"
          onClick={() => clearContents()}
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
