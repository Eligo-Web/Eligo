import { IconAlertTriangleFilled } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { server } from "../ServerUrl";
import "../styles/newpoll.css";
import { PrimaryButton, VoteButton } from "./Buttons.jsx";
import InputField from "./InputField";
import { closePopup } from "./Utils";

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
  const defaultPasscodePH = "Ex: 1234";
  const [passcodeInputPH, setpasscodeInputPH] = useState(defaultPasscodePH);
  const [invalidErr, setInvalidErr] = useState(false);
  const [locErr, setLocError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const control = props.control;
  props = props.childProps;

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  function getKmDistanceFromCoords(lat1, long1, lat2, long2) {
    let R = 6371; // Radius of the earth in km
    let dLat = deg2rad(lat2 - lat1); // deg2rad below
    let dLong = deg2rad(long2 - long1);
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c; // Distance in km
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
    const overlay = document.getElementById("join-session-popup");
    if (overlay.parentNode.isOpen) {
      clearContents();
    }
  }, [control]);

  function checkPasscode() {
    const overlay = document.getElementById("join-session-popup");
    const passcodeField = overlay.querySelector(".passcode-input");
    let valid = true;

    if (!passcode) {
      passcodeField.className += " field-error";
      setpasscodeInputPH("• Required");
      setInvalidErr(false);
      setLocError(false);
      valid = false;
    } else {
      passcodeField.className = "passcode-input form-control";
      setpasscodeInputPH(defaultPasscodePH);
    }
    return valid;
  }

  function clearContents() {
    const overlay = document.getElementById("join-session-popup");
    const passcodeField = overlay.querySelector(".passcode-input");
    passcodeField.className = "passcode-input form-control";
    passcodeField.value = "";
    setpasscodeInputPH(defaultPasscodePH);
    setPasscode("");
    setInvalidErr(false);
    setLocError(false);
  }

  async function checkLocation() {
    let lat = 0;
    let long = 0;
    let distance = 0;
    let present = true;
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
            setLocError(true);
            setInvalidErr(false);
            present = false;
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
    return { lat, long, distance };
  }

  async function joinSession() {
    setLoading(true);
    const { lat, long, distance } = await checkLocation();
    if (!checkPasscode()) {
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
          token: props.token,
        }
      )
      .then((res) => {
        if (res.data.status === 200) {
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
              token: props.token,
            },
          });
        } else if (res.data.status === 401) {
          setInvalidErr(true);
          valid = false;
        }
      });
    if (valid) {
      closePopup("Join Session");
    } else {
      setLoading(false);
    }
  }

  return (
    <div
      className="pop-up-content"
      id="join-session-popup"
      onKeyDown={handleKeyPresses}
    >
      <InputField
        class="passcode-input"
        label="Passcode"
        input={passcodeInputPH}
        onChange={(e) => {
          setPasscode(e.target.value);
        }}
        type="password"
      />
      <div
        className="error-banner"
        style={{ display: invalidErr ? "flex" : "none" }}
      >
        <IconAlertTriangleFilled />
        Failed to join session. Passcode is invalid!
      </div>
      <div
        className="error-banner"
        style={{ display: locErr ? "flex" : "none" }}
      >
        <IconAlertTriangleFilled />
        Location permission denied! Cannot join session.
      </div>
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
  const [dupeError, setDupeError] = useState(false);
  const [invalidError, setInvalidError] = useState(false);
  const [loading, setLoading] = useState(false);

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
      overlay.querySelector(".empty-code").style.display = "block";
      setInvalidError(false);
      setDupeError(false);
      valid = false;
    } else {
      passcodeField.className = "passcode-input form-control";
      overlay.querySelector(".empty-code").style.display = "none";
    }
    return valid;
  }

  function clearContents() {
    const overlay = document.getElementById("content-join-class-popup");
    const passcodeField = overlay.querySelector(".passcode-input");
    passcodeField.className = "passcode-input form-control";
    overlay.querySelector(".empty-code").style.display = "none";
    passcodeField.value = "";
    setInvalidError(false);
    setDupeError(false);
    setPasscode("");
    closePopup("join-class");
  }

  async function joinClass() {
    setLoading(true);
    if (!checkPasscode()) {
      setLoading(false);
      return;
    }
    await axios
      .get(`${server}/course/student/${passcode.toUpperCase()}`, {
        headers: {
          token: props.token,
          email: props.email,
        },
      })
      .then(async (res) => {
        if (res.data.status === 404) {
          setDupeError(false);
          setInvalidError(true);
          setLoading(false);
          return;
        }
        if (res.data.status === 200) {
          const sectionId = res.data.data.sectionId;
          const semester = res.data.data.semester;
          await axios
            .put(`${server}/student/${props.email}`, {
              sectionId: sectionId,
              semester: semester,
              token: props.token,
            })
            .then((res) => {
              if (res.data.status === 409) {
                setInvalidError(false);
                setDupeError(true);
                setLoading(false);
                return;
              }
              props.setRefresh(!props.refresh);
              clearContents();
            });
          await axios.put(
            `${server}/course/${res.data.data.sectionId}/${props.email}`,
            {
              name: props.name,
              token: props.token,
            }
          );
        }
      });
  }

  return (
    <div
      className="pop-up-content"
      id="content-join-class-popup"
      onKeyDown={handleKeyPresses}
    >
      <InputField
        class="passcode-input"
        label="Course Code"
        input="ex: A1B2C3"
        onChange={(e) => setPasscode(e.target.value)}
        errors={{ "empty-code": "Required" }}
        style={{ textTransform: "uppercase" }}
      />
      <div
        className="error-banner"
        style={{ display: dupeError ? "block" : "none" }}
      >
        <IconAlertTriangleFilled />
        You have already joined this course!
      </div>
      <div
        className="error-banner"
        style={{ display: invalidError ? "block" : "none" }}
      >
        <IconAlertTriangleFilled />
        Course with given passcode not found!
      </div>
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

export function Poll(props) {
  const [selected, setSelected] = useState(null);
  const [voteButtons, setVoteButtons] = useState(null);

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
    await axios.patch(
      `${server}/course/${props.sectionId}/${props.weekNum}/${props.sessionId}/${props.pollId}`,
      {
        email: props.email,
        timestamp: Date.now().toString(),
        response: choice,
        token: props.token,
      }
    );
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
