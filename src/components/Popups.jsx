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

import { IconAlertTriangleFilled } from "@tabler/icons-react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { server } from "../ServerUrl";
import { GlobalPopupContext } from "../containers/InAppContainer";
import "../styles/newpoll.css";
import { PrimaryButton, VoteButton } from "./Buttons.jsx";
import InputField from "./InputField";
import pause, { closePopup, sessionValid } from "./Utils";

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

export function FloatError(props) {
  const [prevMsg, setPrev] = useState("");

  useEffect(() => {
    // visually preserve state when clearing message
    if (props.msg) setPrev(props.msg);
  });

  return (
    <div className="banner-wrapper">
      <div
        className="error-banner floating-banner"
        style={{
          opacity: props.msg ? 1 : 0,
          pointerEvents: props.msg ? "all" : "none",
        }}
      >
        <IconAlertTriangleFilled />
        {props.msg || prevMsg || ""}
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
          id={"cancel-delete-" + props.id}
          variant="secondary"
          label="Cancel"
          onClick={props.cancelClick}
        />
        <PrimaryButton
          id={"confirm-delete-" + props.id}
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
  const [passInputError, setpassInputError] = useState("");
  const [showError, setShowError] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useContext(GlobalPopupContext);
  const navigate = useNavigate();
  const control = props.control;
  props = props.childProps;

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  function getKmDistanceFromCoords(lat1, long1, lat2, long2) {
    let R = 6371; // Radius of the earth in km
    let dLat = deg2rad(lat2 - lat1); // get radians
    let dLong = deg2rad(long2 - long1);
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c * 1000; // Distance in m
    return d;
  }

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
    const overlay = document.getElementById("content-join-session-popup");
    if (!overlay) return;
    const isOpen = !!overlay.parentNode.isOpen;
    if (isOpen && control) {
      clearContents();
    }
  }, [control]);

  function checkPasscode() {
    const overlay = document.getElementById("join-session-popup");
    const passcodeField = overlay.querySelector(".passcode-input");
    let valid = true;

    if (!passcode) {
      passcodeField.className += " field-error";
      passcodeField.parentNode.parentNode.className += " input-error";
      setpassInputError("• Passcode required");
      setShowError("");
      valid = false;
    } else {
      passcodeField.className = "passcode-input form-control";
      passcodeField.parentNode.parentNode.className = "input-field";
      setpassInputError("");
    }
    return valid;
  }

  function clearContents() {
    const overlay = document.getElementById("join-session-popup");
    const passcodeField = overlay.querySelector(".passcode-input");
    passcodeField.className = "passcode-input form-control";
    passcodeField.parentNode.parentNode.className = "input-field";
    passcodeField.value = "";
    setpassInputError("");
    setPasscode("");
    setShowError("");
    pause(100).then(() => {
      closePopup("join-session", setPopup);
    });
  }

  async function checkLocation() {
    let lat = 0;
    let long = 0;
    let distance = 0;
    let enabled = true;
    let thisError = false;
    if (props.session.latitude && props.session.longitude) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          lat = position.coords.latitude;
          long = position.coords.longitude;
          distance = getKmDistanceFromCoords(
            lat,
            long,
            props.session.latitude,
            props.session.longitude
          );
        },
        (error) => {
          thisError = error.PERMISSION_DENIED;
          if (thisError) {
            setShowError("Location denied! Cannot join session.");
            enabled = false;
          }
        }
      );
      const button = document.getElementById("join-session-button");
      let buttonText;
      if (button) {
        buttonText = button.childNodes[0];
        buttonText.data = "Joining...";
      }
      while (lat === 0 && long === 0 && !thisError) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (button) {
        buttonText.data = "Join";
      }
    }
    return { lat, long, distance, enabled };
  }

  async function joinSession() {
    setLoading(true);
    const { lat, long, distance, enabled } = await checkLocation();
    if (!checkPasscode() || !enabled) {
      setLoading(false);
      return;
    }
    let valid = true;
    await axios
      .post(
        `${server}/course/${props.sectionId}/${props.weekNum}/${props.sessionId}/${props.email}/${passcode}`,
        {
          latitude: lat,
          longitude: long,
          distance: distance,
        }
      )
      .then(() => {
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
            clickerId: props.clickerId,
          },
        });
      })
      .catch((err) => {
        if (!sessionValid(err.response, setPopup)) return;
        setShowError("Failed to join session. Invalid passcode!");
        valid = false;
      });
    if (valid) {
      closePopup("join-session", setPopup);
    } else {
      setLoading(false);
    }
  }

  return (
    <div
      className="pop-up-content join-session-width"
      id="content-join-session-popup"
      onKeyDown={handleKeyPresses}
    >
      <InputField
        class="passcode-input"
        label="Passcode"
        input="ex: 1234"
        onChange={(e) => setPasscode(e.target.value)}
        errorState={passInputError}
      />
      <FloatError msg={showError} />
      <div className="button-row">
        <PrimaryButton
          id="join-session"
          variant="primary"
          label="Join"
          onClick={() => joinSession()}
          loading={loading}
        />
      </div>
    </div>
  );
}

export function JoinClass(props) {
  const [passcode, setPasscode] = useState("");
  const [showError, setShowError] = useState("");
  const [passFieldError, setPassFieldError] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useContext(GlobalPopupContext);

  const handleKeyPresses = (event) => {
    switch (event.key) {
      case "Escape":
        clearContents();
        break;
      case "Enter":
        joinClass();
        break;
    }
  };

  useEffect(() => {
    const overlay = document.getElementById("content-join-class-popup");
    if (overlay.parentNode.isOpen) {
      clearContents();
    }
  }, [props.control]);

  function checkPasscode() {
    const overlay = document.getElementById("content-join-class-popup");
    const passcodeField = overlay.querySelector(".passcode-input");
    let valid = true;

    if (!passcode) {
      passcodeField.className += " field-error";
      passcodeField.parentNode.parentNode.className += " input-error";
      setPassFieldError("• Passcode required");
      setShowError("");
      valid = false;
    } else {
      passcodeField.className = "passcode-input form-control";
      passcodeField.parentNode.parentNode.className = "input-field";
      setPassFieldError("");
      setShowError("");
    }
    return valid;
  }

  function clearContents() {
    const overlay = document.getElementById("content-join-class-popup");
    const passcodeField = overlay.querySelector(".passcode-input");
    passcodeField.className = "passcode-input form-control";
    passcodeField.parentNode.parentNode.className = "input-field";
    passcodeField.value = "";
    setPassFieldError("");
    setShowError("");
    setPasscode("");
    pause(100).then(() => {
      closePopup("join-class");
    });
  }

  async function joinClass() {
    setLoading(true);
    if (!checkPasscode()) {
      setLoading(false);
      return;
    }
    await axios
      .get(`${server}/course/student/${passcode.toUpperCase()}`)
      .then(async (res) => {
        const sectionId = res.data.data.sectionId;
        const semester = res.data.data.semester;
        await axios
          .put(`${server}/student/${props.email}`, {
            sectionId: sectionId,
            semester: semester,
          })
          .then(() => {
            props.setRefresh(!props.refresh);
            clearContents();
          })
          .catch((err) => {
            if (!sessionValid(err.response, setPopup)) return;
            setShowError("You have already joined this course!");
            setLoading(false);
            return;
          });
        await axios
          .put(`${server}/course/${res.data.data.sectionId}/${props.email}`, {
            name: props.name,
          })
          .catch((err) => {
            if (!sessionValid(err.response, setPopup)) return;
          });
      })
      .catch((err) => {
        if (!sessionValid(err.response, setPopup)) return;
        setShowError("Course with given passcode not found!");
        setLoading(false);
        return;
      });
  }

  return (
    <div
      className="pop-up-content join-class-width"
      id="content-join-class-popup"
      onKeyDown={handleKeyPresses}
    >
      <InputField
        class="passcode-input"
        label="Course Code"
        input="ex: A1B2C3"
        onChange={(e) => setPasscode(e.target.value)}
        style={{ textTransform: "uppercase" }}
        errorState={passFieldError}
      />
      <FloatError msg={showError} />
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
          loading={loading}
        />
      </div>
    </div>
  );
}

export function SessionExpired(props) {
  const navigate = useNavigate();
  return (
    <div className="pop-up-content hug">
      <div
        className="flex-center gap-2 error-banner"
        style={{ margin: "0 1rem", whiteSpace: "nowrap" }}
      >
        <IconAlertTriangleFilled />
        Your session has timed out. Please log back in.
      </div>
      <PrimaryButton
        label="Ok"
        onClick={() => {
          navigate("/");
        }}
      />
    </div>
  );
}

export function Poll(props) {
  const [selected, setSelected] = useState(null);
  const [voteButtons, setVoteButtons] = useState(null);
  const [popup, setPopup] = useContext(GlobalPopupContext);

  useEffect(() => {
    if (voteButtons) return;
    setVoteButtons({
      A: document.getElementById("A-button"),
      B: document.getElementById("B-button"),
      C: document.getElementById("C-button"),
      D: document.getElementById("D-button"),
      E: document.getElementById("E-button"),
    });
  }, []);

  async function makeSelection(choice) {
    setSelected(choice);
    await axios
      .patch(
        `${server}/course/${props.sectionId}/${props.weekNum}/${props.sessionId}/${props.pollId}`,
        {
          email: props.email,
          timestamp: Date.now().toString(),
          response: choice,
        }
      )
      .catch((err) => {
        if (!sessionValid(err.response, setPopup)) return;
      });
  }

  useEffect(() => {
    if (selected && voteButtons) {
      for (let btn in voteButtons) {
        if (btn === selected) continue;
        voteButtons[btn].className = "card btn btn-vote";
      }
      voteButtons[selected].className += " btn-active";
    }
  }, [selected]);

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
