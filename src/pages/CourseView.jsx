import Container from "react-bootstrap/Container";
import { IoMdAddCircleOutline } from "react-icons/io";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import SessionCard from "../components/SessionCard";
import { BackButton, IconButton } from "../components/Buttons.jsx";
import Overlay from "../components/Overlay";
import { useNavigate, useLocation } from "react-router-dom";
import { openPopup } from "../components/Overlay";
import { IconDownload, IconList } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "../styles/cards.css";
import AccessDenied from "../components/AccessDenied";
import { BlankCourseView } from "../components/BlankStates";
import axios from "axios";

function CourseView(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const authorized = location.state && location.state.permission;
  const [buttonLabels, setLabels] = useState(window.innerWidth > 900);
  const [refresh, setRefresh] = useState(false);
  const server = "http://localhost:3000";

  function pause() {
    return new Promise((res) => setTimeout(res, 250));
  }

  useEffect(() => {
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

  window.onresize = function () {
    if (window.innerWidth < 900) {
      setLabels(false);
    } else if (!buttonLabels) {
      setLabels(true);
    }
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

  function handleViewSession(sessionId, session) {
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
        passcode: session.passcode,
        classPasscode: location.state.passcode,
        semester: location.state.semester,
        weekNum: getWeekNumber(),
      },
    });
  }

  async function handleViewRoster() {
    let students = [];
    await axios
      .get(`${server}/course/${location.state.sectionId}`)
      .then((res) => {
        students = res.data.data.students;
      })
      .catch((err) => console.log(err));

    navigate("/roster", {
      state: {
        name: location.state.name,
        permission: location.state.permission,
        email: location.state.email,
        sectionId: location.state.sectionId,
        courseName: location.state.courseName,
        passcode: location.state.passcode,
        semester: location.state.semester,
        students: students,
      },
    });
  }

  async function populateSessionCards() {
    let courseSessions;
    await axios
      .get(`${server}/course/${location.state.sectionId}`)
      .then((res) => {
        courseSessions = res.data.data.sessions;
        courseSessions = toMap(courseSessions).sort();
      })
      .catch((err) => console.log(err));
    const sessionList = [];
    const overlays = [];

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
        weekSessions.push(
          <SessionCard
            key={id}
            id={id}
            title={session.name}
            active={session.active}
            onClick={() => handleViewSession(id, session)}
          />
        );
        overlays.push(
          <Overlay
            key={id}
            id={id}
            title="Edit Session"
            session={session}
            sectionId={location.state.sectionId}
            refresh={refresh}
            setRefresh={setRefresh}
            editSession
          />
        )
      }
      sessionList.push(
        <Container className="card-container" key={weekNum}>
          <h3 className="card-title divisor">{weeklabel}</h3>
          {weekSessions.reverse()}
        </Container>
      );
    }
    return [sessionList.reverse(), overlays];
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
          },
        })
      }
    />
  );

  function studentContent() {
    const [sessionOpen, setSessionOpen] = useState(false);
    const [props, setProps] = useState({
      sectionId: "",
      sessionId: "",
      session: "",
      weekNum: "",
      email: "",
    });
    let container;

    async function checkSession() {
      await axios
        .get(`${server}/course/${location.state.sectionId}/${getWeekNumber()}/`)
        .then((res) => {
          console.log(res);
          const session = res.data.data;
          if (res.data.data) {
            if (
              res.data.data.activeSession.students.includes(
                location.state.email
              )
            ) {
              navigate("/session", {
                state: {
                  name: location.state.name,
                  permission: location.state.permission,
                  email: location.state.email,
                  sessionId: session.activeSessionId,
                  sectionId: location.state.sectionId,
                  sessionName: session.activeSession.name,
                },
              });
            }
            setSessionOpen(true);
            openPopup("Join Session");
            setProps({
              sectionId: location.state.sectionId,
              sessionId: res.data.data.activeSessionId,
              session: res.data.data.activeSession,
              weekNum: getWeekNumber(),
              email: location.state.email,
            });
          }
        })
        .catch((err) => console.log(err));
      container.style.opacity = 100;
    }

    useEffect(() => {
      container = document.getElementById("session-container");
      checkSession();
      const interval = setInterval(() => {
        checkSession();
      }, 5000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="d-flex flex-column ">
        <Overlay
          title="Join Session"
          id="Join Session"
          joinSessionProps={props}
          joinSession
        />
        <div className="card-wrapper">
          {backButton}
          <div id="session-container" className="session-container">
            <div className="card-title d-flex justify-content-center align-items-center p-5 gap-5">
              <div className="m-5 p-5 gap-4 d-flex flex-column align-items-center">
                <div className="blank-state-msg">
                  {sessionOpen
                    ? "Your instructor has started a session!"
                    : "Hmm... It seems your instructor has not started a session yet."}
                </div>
                <Button
                  variant="blank-state"
                  className="large-title"
                  onClick={() => {
                    sessionOpen
                      ? openPopup("Join Session")
                      : window.location.reload();
                  }}
                >
                  {sessionOpen ? "Join Session" : "Refresh"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function instructorContent() {
    const [cards, setCards] = useState(<BlankCourseView />);
    const [editOverlays, setEditOverlays] = useState(null);

    useEffect(() => {
      const container = document.getElementById("semester-container");
      async function loadContent() {
        const [sessionList, overlays] = await populateSessionCards("INSTRUCTOR");
        container.style.opacity = 0;
        await pause();
        setCards(sessionList);
        setEditOverlays(overlays);
        container.style.opacity = 100;
      }
      loadContent();
    }, [refresh]);

    return (
      <div className="d-flex flex-column ">
        <div className="card-wrapper">
          <Overlay
            title="Create Session"
            id="Create Session"
            sectionId={location.state.sectionId}
            refresh={refresh}
            setRefresh={setRefresh}
            createSession
          />
          {editOverlays}
          {backButton}
          <div id="semester-container" className="semester-container">
            {cards}
          </div>
        </div>
        <div className="courses-bottom-row bottom-0 gap-3">
          <IconButton
            label="Create Session"
            icon={<IoMdAddCircleOutline size="1.7em" />}
            onClick={() => openPopup("Create Session")}
            style={{ maxWidth: "max-content" }}
          />
          <div className="row gap-3 p-3">
            <IconButton
              label={buttonLabels ? "Download Class Data" : null}
              icon={<IconDownload size="1.6em" />}
              variant="outline"
              style={{ maxWidth: "max-content" }}
            />
            <IconButton
              label={buttonLabels ? "View Roster" : null}
              icon={<IconList size="1.6em" />}
              variant="outline"
              onClick={() => handleViewRoster()}
              style={{ maxWidth: "max-content" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return !authorized ? (
    <AccessDenied />
  ) : (
    <div>
      <Menu
        leaveAction={location.state.permission === "STUDENT"}
        hideCreate={location.state.permission === "INSTRUCTOR"}
      />
      <MenuBar
        title={location.state.courseName}
        description={location.state.passcode}
        onClick={props.onClick}
        clickable
        showDescription={location.state.permission !== "STUDENT"}
      />
      {location.state.permission === "STUDENT"
        ? studentContent()
        : instructorContent()}
    </div>
  );
}

export default CourseView;
