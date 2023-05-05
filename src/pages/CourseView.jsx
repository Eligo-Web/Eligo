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

import { IconList } from "@tabler/icons-react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { server } from "../ServerUrl";
import waitingCourseImg from "../assets/empty-course-state.png";
import AccessDenied from "../components/AccessDenied";
import {
  EmptyCourseView,
  InstructorScreenAlert,
  LoadingCourseView,
} from "../components/BlankStates";
import {
  BackButton,
  FloatingButton,
  IconButton,
} from "../components/Buttons.jsx";
import * as clicker from "../components/ClickerBase";
import Menu from "../components/Menu";
import MenuBar from "../components/MenuBar";
import Overlay from "../components/Overlay";
import SessionCard from "../components/SessionCard";
import pause, {
  displayMessage,
  encodeEmail,
  openPopup,
} from "../components/Utils";
import { ClickerContext, EditPopupContext } from "../containers/InAppContainer";
import "../styles/cards.css";

function CourseView() {
  const location = useLocation();
  const navigate = useNavigate();
  const authorized = location.state && location.state.permission;
  const [hideLabels, setHideLabels] = useState(window.innerWidth < 650);
  const [refresh, setRefresh] = useState(false);
  const [base, setBase] = useContext(ClickerContext);
  const [editPopup, setEditPopup] = useContext(EditPopupContext);

  async function loadBase() {
    let newBase = await clicker.openDevice();
    if (newBase && !base) {
      setBase(await clicker.initialize(newBase));
    }
  }

  if (navigator.hid && base) {
    navigator.hid.ondisconnect = ({ device }) => {
      if (device.vendorId === 0x1881) {
        const msg = document.querySelector(".disconnected-tooltip");
        if (msg) displayMessage(msg);
        setBase(null);
      }
    };
  }

  useEffect(() => {
    setEditPopup(null);
    if (
      navigator.userAgent.indexOf("Safari") != -1 &&
      navigator.userAgent.indexOf("Chrome") == -1
    ) {
      if (document.querySelectorAll(".session-card")) {
        document.querySelectorAll(".session-card").forEach((card) => {
          card.style.backgroundColor = "#c8e2fb";
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!navigator.hid) return;
    async function reconnectBase() {
      const devices = await navigator.hid.getDevices();
      if (devices.length && !devices[0].opened) {
        const device = devices[0];
        setBase(device);
        try {
          await device.open();
        } catch (err) {
          console.log(err);
        }
      }
    }
    reconnectBase();
  }, []);

  useEffect(() => {
    if (editPopup) {
      openPopup(editPopup.key);
    }
  }, [editPopup]);

  window.onresize = function () {
    setHideLabels(window.innerWidth < 650);
  };

  function toMap(object) {
    return Object.entries(object);
  }

  function getWeekNumber(offset) {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const yrProgress = (currentDate - startDate) / (24 * 60 * 60 * 1000);
    const currWeekNum = Math.ceil(yrProgress / 7) + (offset || 0);
    return `${currentDate.getFullYear()}-${currWeekNum}`;
  }

  function getWeekLabel(weekNum) {
    const format = { month: "short", day: "numeric" };
    const weekInfo = weekNum.split("-");
    let date1 = new Date(weekInfo[0], 0, (weekInfo[1] - 1) * 7 + 2);
    date1 = date1.toLocaleDateString("default", format);
    let date2 = new Date(weekInfo[0], 0, weekInfo[1] * 7 - 1);
    date2 = date2.toLocaleDateString("default", format);
    return `Week of ${date1} - ${date2}`;
  }

  function handleViewSession(sessionId, session, weekNum) {
    navigate("/session", {
      state: {
        name: location.state.name,
        permission: location.state.permission,
        email: location.state.email,
        sessionId: sessionId,
        sessionName: session.name,
        sectionId: location.state.sectionId,
        sessionActive: session.active,
        courseName: location.state.courseName,
        sessionPasscode: session.passcode,
        classPasscode: location.state.classPasscode,
        semester: location.state.semester,
        weekNum: weekNum,
        clickerId: location.state.clickerId,
        token: location.state.token,
      },
    });
  }

  async function handleViewRoster() {
    let students = [];
    await axios
      .get(`${server}/course/${location.state.sectionId}`, {
        headers: {
          token: location.state.token,
          email: location.state.email,
        },
      })
      .then((res) => {
        students = res.data.data.students;
      });

    navigate("/roster", {
      state: {
        name: location.state.name,
        permission: location.state.permission,
        email: location.state.email,
        sectionId: location.state.sectionId,
        courseName: location.state.courseName,
        classPasscode: location.state.classPasscode,
        semester: location.state.semester,
        students: students,
        clickerId: location.state.clickerId,
        token: location.state.token,
      },
    });
  }

  async function populateSessionCards() {
    let courseSessions;
    await axios
      .get(`${server}/course/${location.state.sectionId}`, {
        headers: {
          token: location.state.token,
          email: location.state.email,
        },
      })
      .then((res) => {
        courseSessions = res.data.data.sessions;
        courseSessions = toMap(courseSessions).sort();
      });
    const sessionList = [];

    for (let [weekNum, week] of courseSessions) {
      week = toMap(week).sort();
      if (week.length === 0) {
        continue;
      }
      let weeklabel = getWeekLabel(weekNum);
      if (weekNum === getWeekNumber()) weeklabel = "This week";
      else if (weekNum === getWeekNumber(-1)) weeklabel = "Last Week";

      let weekSessions = [];
      for (let [id, session] of week) {
        const popup = (
          <Overlay
            key={id}
            id={id}
            title="Edit Session"
            session={session}
            weekNum={weekNum}
            sectionId={location.state.sectionId}
            refresh={refresh}
            setRefresh={setRefresh}
            token={location.state.token}
            editSession
          />
        );
        weekSessions.push(
          <SessionCard
            key={id}
            id={id}
            title={session.name}
            active={session.active}
            onEdit={() => setEditPopup(popup)}
            onClick={() => handleViewSession(id, session, weekNum)}
          />
        );
      }
      sessionList.push(
        <Container className="card-container" key={weekNum}>
          <h3 className="card-title divisor">{weeklabel}</h3>
          {weekSessions.reverse()}
        </Container>
      );
    }

    if (!sessionList.length) {
      return null;
    }
    return sessionList.reverse();
  }

  const backButton = (
    <BackButton
      label="Overview"
      onClick={() =>
        navigate("/overview", {
          state: {
            name: location.state.name,
            permission: location.state.permission,
            email: location.state.email,
            clickerId: location.state.clickerId,
            token: location.state.token,
          },
        })
      }
    />
  );

  function studentContent() {
    const [sessionOpen, setSessionOpen] = useState(false);
    const [joining, setJoining] = useState("");
    const [props, setProps] = useState({
      name: "",
      permission: "",
      email: "",
      sectionId: "",
      sessionId: "",
      session: "",
      sessionName: "",
      weekNum: "",
      token: "",
    });

    async function checkSession() {
      await axios
        .get(
          `${server}/course/${location.state.sectionId}/${getWeekNumber()}`,
          {
            headers: {
              token: location.state.token,
              email: location.state.email,
            },
          }
        )
        .then(async (res) => {
          const session = res.data.data;
          if (session) {
            if (
              session.activeSession.students[encodeEmail(location.state.email)]
            ) {
              setJoining(session.activeSession.name);
              document.querySelector(".img-container").style.opacity = 1;
              await pause(1000);
              navigate("/session", {
                state: {
                  name: location.state.name,
                  permission: location.state.permission,
                  email: location.state.email,
                  courseName: location.state.courseName,
                  sectionId: location.state.sectionId,
                  sessionId: session.activeSessionId,
                  session: session.activeSession,
                  sessionName: session.activeSession.name,
                  weekNum: getWeekNumber(),
                  clickerId: location.state.clickerId,
                  token: location.state.token,
                },
              });
            }
            setSessionOpen(true);
            document.querySelector(".img-container").style.opacity = 1;
            const thisProps = {
              name: location.state.name,
              permission: location.state.permission,
              email: location.state.email,
              courseName: location.state.courseName,
              sectionId: location.state.sectionId,
              sessionId: session.activeSessionId,
              session: session.activeSession,
              sessionName: session.activeSession.name,
              weekNum: getWeekNumber(),
              clickerId: location.state.clickerId,
              token: location.state.token,
            };
            setEditPopup(
              <Overlay
                key="join-session"
                title="Join Session"
                id="join-session"
                joinSessionProps={thisProps}
                joinSession
              />
            );
            setProps(thisProps);
          }
        });
      document.querySelector(".img-container").style.opacity = 1;
    }

    useEffect(() => {
      checkSession();
    }, []);

    return (
      <div className="d-flex flex-column ">
        {editPopup}
        {backButton}
        <div className="card-wrapper-student">
          <div className="img-container" style={{ padding: "3rem 0" }}>
            <img src={waitingCourseImg} className="waiting-state-img" />
            <div className="blank-state-msg m-1">
              {joining
                ? `Please wait. Joining "${joining}"...`
                : sessionOpen
                ? "Your instructor has started a session!"
                : "Hmm... It seems your instructor has not started a session yet."}
            </div>
            {joining ? null : (
              <Button
                variant="blank-state"
                className="large-title"
                onClick={() => {
                  sessionOpen
                    ? setEditPopup(
                        <Overlay
                          key="join-session"
                          title="Join Session"
                          id="join-session"
                          joinSessionProps={props}
                          joinSession
                        />
                      )
                    : window.location.reload();
                }}
              >
                {sessionOpen ? "Join Session" : "Refresh"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  function instructorContent() {
    const [cards, setCards] = useState(<LoadingCourseView />);

    useEffect(() => {
      const container = document.querySelector(".semester-container");
      async function loadContent() {
        const sessionList = await populateSessionCards("INSTRUCTOR");
        await pause(250);
        container.style.opacity = 0;
        await pause(100);
        setCards(sessionList);
        container.style.opacity = 1;
      }
      loadContent();
    }, [refresh]);

    return (
      <div className="d-flex flex-column ">
        <InstructorScreenAlert />
        {backButton}
        {editPopup}
        <FloatingButton base={base} onClick={() => loadBase()} />
        <div className="card-wrapper">
          {cards ? null : <EmptyCourseView />}
          <div className="semester-container">{cards}</div>
        </div>
        <div className="courses-bottom-row bottom-0 gap-3">
          <div className="d-flex flex-row gap-3">
            <IconButton
              label="View Roster"
              hideLabel={hideLabels}
              icon={<IconList size="1.6em" />}
              variant="outline"
              onClick={() => handleViewRoster()}
              style={{ maxWidth: "max-content" }}
            />
          </div>
          <IconButton
            label="Create Session"
            icon={<IoMdAddCircleOutline size="1.7em" />}
            onClick={() =>
              setEditPopup(
                <Overlay
                  key="create-session"
                  title="Create Session"
                  id="create-session"
                  sectionId={location.state.sectionId}
                  refresh={refresh}
                  setRefresh={setRefresh}
                  token={location.state.token}
                  createSession
                />
              )
            }
            style={{ maxWidth: "max-content" }}
          />
        </div>
      </div>
    );
  }

  return !authorized ? (
    <AccessDenied />
  ) : (
    <div>
      <title>{location.state.courseName} | Eligo</title>
      <Menu
        leaveAction={location.state.permission === "STUDENT"}
        hideCreate={location.state.permission === "INSTRUCTOR"}
      />
      <MenuBar
        title={location.state.courseName}
        description={location.state.classPasscode}
        showDescription={location.state.permission !== "STUDENT"}
        courseView
        clickable
      />
      {location.state.permission === "STUDENT"
        ? studentContent()
        : instructorContent()}
    </div>
  );
}

export default CourseView;
