import React, { useEffect, useState } from "react";
import { PrimaryButton, VoteButton } from "./Buttons.jsx";
import {
  IconChartBar,
  IconChartBarOff,
  IconChartInfographic,
  IconMaximize,
  IconMinimize,
  IconPlayerStopFilled,
} from "@tabler/icons-react";
import { closePopup } from "./Overlay";
import InputField from "./InputField";
import NewWindow from "react-new-window";
import axios from "axios";
import { Row } from "react-bootstrap";
import "../styles/newpoll.css";

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
        <PrimaryButton
          variant="primary"
          label="Create"
          onClick={() => postCourse(name, section)}
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

// ================== New Poll Window Popup ================== //

export function InstructorPoll() {
  const [minimized, setMinimized] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const winWidth = window.outerWidth - window.innerWidth;
  const winHeight = window.outerHeight - window.innerHeight;
  let fullHeight = winHeight;
  let fullWidth = winWidth;

  function resizeToContent() {
    const content = document.querySelector(".newpoll-pop-up");
    fullWidth = winWidth + content.offsetWidth;
    fullHeight = winHeight + content.offsetHeight;
    window.resizeTo(fullWidth, fullHeight);
  }

  window.onload = function () {
    if (window.parent["name"] === "New Poll") {
      window.document.title = "New Poll";
      resizeToContent();
    }
  };

  window.onresize = function () {
    window.resizeTo(fullWidth, fullHeight);
  };

  useEffect(() => {
    if (document.querySelector(".newpoll-pop-up")) {
      resizeToContent();
    }
  }, [minimized]);

  useEffect(() => {
    if (document.querySelector(".newpoll-pop-up")) {
      // resizeToContent();
    }
  }, [showChart]);

  return (
    <div className="newpoll-wrapper" id="New Poll">
      <div className="newpoll newpoll-pop-up">
        <div className="newpoll-pop-up-content">
          <div className="d-flex align-items-center gap-3">
            <Stopwatch />
            {showChart ? (
              <IconChartBarOff
                className="data-chart"
                size="2.8rem"
                onClick={() => setShowChart(!showChart)}
              />
            ) : (
              <IconChartBar
                className="data-chart"
                size="2.8rem"
                onClick={() => setShowChart(!showChart)}
              />
            )}
            {/* {ChartToggle({toggle: showChart, onClick: () => setShowChart(!showChart)})} */}
            {minimized ? (
              <IconMaximize
                className="minimize"
                size="2.8rem"
                onClick={() => setMinimized(!minimized)}
              />
            ) : (
              <IconMinimize
                className="minimize"
                size="2.8rem"
                onClick={() => setMinimized(!minimized)}
              />
            )}
          </div>
          {minimized ? null : (
            <div className="input-group">
              <InputField label="Poll Name" input="ex: Question 1" />
            </div>
          )}
          {minimized ? null : (
            <div className="button-row">
              <PrimaryButton
                variant="secondary"
                label="Discard"
                onClick={() => {
                  console.log("discarded poll");
                  window.close();
                }}
              />
              <PrimaryButton
                variant="primary"
                label="Save"
                onClick={() => {
                  console.log("saved poll");
                  window.close();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stopwatch() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);

  function stopTime() {
    setRunning(false);
    const btn = document.querySelector(".stop-button");
    const watch = document.querySelector(".stopwatch");
    const timeText = document.querySelector(".min-sec");
    btn.style.opacity = 0;
    btn.style.width = 0;
    btn.style.marginRight = 0;
    watch.style.gap = 0;
    watch.style.backgroundColor = "#c2d3f3";
    watch.style.color = "#1b2543";
    console.log(time);
    timeText.style.width = "fit-content";
  }

  useEffect(() => {
    let interval;
    if (running) {
      if (time >= 3600) {
        setRunning(false);
      }
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!running) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  return (
    <div className="stopwatch">
      <div className="min-sec">
        <span>{("0" + Math.floor((time / 60) % 60)).slice(-2)}:</span>
        <span>{("0" + Math.floor(time % 60)).slice(-2)}</span>
      </div>
      <div className="stopwatch-buttons">
        <IconPlayerStopFilled
          className="stop-button"
          preserveAspectRatio="none"
          onClick={() => stopTime()}
        />
      </div>
    </div>
  );
}

function ChartToggle(props) {
  const components = { 0: IconChartBar, 1: IconChartBarOff };
  let ChartButton = components[props.toggle];
  return (
    <ChartButton className="data-chart" size="2.8rem" onClick={props.onClick} />
  );
}
