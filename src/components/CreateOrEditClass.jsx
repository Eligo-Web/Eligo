import { IconAlertTriangleFilled } from "@tabler/icons-react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { server } from "../ServerUrl";
import { EditPopupContext } from "../containers/InAppContainer";
import { pause } from "../pages/CourseView";
import "../styles/newpoll.css";
import { PrimaryButton } from "./Buttons.jsx";
import InputField, { SelectField } from "./InputField";
import { closePopup } from "./Overlay";

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
      token={props.token}
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
      token={props.token}
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
  const validCharset = /^[a-zA-Z0-9\s\p{P}\p{S}]+$/u;
  const location = useLocation();
  const popupName = props.editMode
    ? toSectionId(props.name + props.section + props.semester)
    : "create-class";
  const [defaultNamePH, defaultsisIdPH, defaultSectionPH] = [
    "ex: Intermediate Programming",
    "ex: EN.601.220",
    "1, 2, ...",
  ];
  const [nameInputPH, setNameInputPH] = useState(defaultNamePH);
  const [sisIDInputPH, setSisIDInputPH] = useState(defaultsisIdPH);
  const [sectionInputPH, setSectionInputPH] = useState(defaultSectionPH);
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
        const button = document.getElementById(
          "save-" + props.sectionId + "-button"
        );
        handleSaveCreate(null, button);
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
    setNameInputPH(defaultNamePH);
    setSisIDInputPH(defaultsisIdPH);
    setSectionInputPH(defaultSectionPH);
    closePopup(popupName, setPopup);
  }

  function paramsValid() {
    const overlay = document.getElementById(popupName);
    const nameField = overlay.querySelector(".name-input");
    const sectionField = overlay.querySelector(".section-input");
    const sisIdField = overlay.querySelector(".sis-id-input");
    valid = true;

    if (!name) {
      setNameInputPH("• Required");
      nameField.className += " field-error";
      valid = false;
    } else if (!validCharset.test(name + section + semester)) {
      setNameInputPH("• Invalid characters");
      nameField.className += " field-error";
      valid = false;
    } else {
      setNameInputPH(defaultNamePH);
      nameField.className = "name-input form-control";
    }

    if (!section) {
      setSectionInputPH("• Required");
      sectionField.className += " field-error";
      valid = false;
    } else if (isNaN(section) || section < 1) {
      setSectionInputPH("• Invalid section");
      sectionField.className += " field-error";
      valid = false;
    } else {
      sectionField.className = "section-input form-control";
    }

    if (sisId && !/^[A-Z]{2}\.\d{3}\.\d{3}$/.test(sisId)) {
      sisIdField.value = "";
      setSisIDInputPH("• Invalid format");
      sisIdField.className += " field-error";
      valid = false;
    } else {
      setSisIDInputPH(defaultsisIdPH);
      sisIdField.className = "sis-id-input form-control";
    }
    return valid;
  }

  async function handleSaveCreate(event, element = null) {
    const button = event ? event.target : element;
    const loadMsg = props.editMode ? "Saving..." : "Creating...";
    const original = button.childNodes[0].data;
    button.childNodes[0].data = loadMsg;
    props.editMode ? await putCourse() : await postCourse();
    button.childNodes[0].data = original;
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
        token: location.state.token,
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
      token: location.state.token,
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

    await axios
      .get(`${server}/course/${sectionId}`, {
        headers: {
          token: location.state.token,
        },
      })
      .then((res) => {
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
        token: location.state.token,
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
        token: location.state.token,
      }
    );
    for (let student in course.students) {
      await axios.put(
        `${server}/student/${student}/${props.semester}/${oldSectionId}`,
        {
          newSectionId: sectionId,
          newSemester: semester,
          requester: location.state.email,
          token: location.state.token,
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
    await axios
      .delete(`${server}/course/${oldSectionId}`, {
        token: location.state.token,
        email: location.state.email,
      })
      .then((res) => {
        students = res.data.data.students;
      });
    await axios.delete(
      `${server}/instructor/${location.state.email}/${props.semester}/${oldSectionId}`,
      {
        headers: { token: location.state.token },
      }
    );
    for (let student in students) {
      await axios.delete(
        `${server}/student/${student}/${props.semester}/${oldSectionId}`,
        {
          headers: {
            token: location.state.token,
            requester: location.state.email,
          },
        }
      );
    }
    closePopup(popupName, setPopup);
    setRefresh(!refresh);
  }

  return (
    <div className="pop-up-content" id={popupName} onKeyDown={handleKeyPresses}>
      <div className="input-group">
        <InputField
          class="name-input"
          label="Class Name"
          input={nameInputPH}
          default={props.name || ""}
          onChange={(e) => setName(e.target.value)}
        />
        <InputField
          small
          class="sis-id-input"
          label="Course ID (opt.)"
          input={sisIDInputPH}
          default={props.sisId || ""}
          onChange={(e) => setSISId(e.target.value.toUpperCase())}
          style={{ textTransform: "uppercase" }}
        />
      </div>
      <div className="input-group">
        <InputField
          small
          class="section-input"
          label="Section No."
          input={sectionInputPH}
          default={props.section || ""}
          onChange={(e) => setSection(e.target.value)}
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
        style={{ display: showError ? "flex" : "none" }}
      >
        <IconAlertTriangleFilled />
        Warning: This course already exists!
      </div>
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
          onClick={(event) => handleSaveCreate(event)}
        />
      </div>
    </div>
  );
}
