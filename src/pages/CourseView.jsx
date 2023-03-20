import Container from "react-bootstrap/Container";
import { IoMdAddCircleOutline } from "react-icons/io";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import SessionCard from "../components/SessionCard";
import { BackButton, IconButton } from "../components/Buttons.jsx";
import Overlay from "../components/Overlay";
import { useNavigate, useLocation } from "react-router-dom";
import { CreateSession, JoinSession } from "../components/Popups";
import { openPopup } from "../components/Overlay";
import { IconArrowLeft, IconDownload, IconList } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "../styles/cards.css";
import AccessDenied from "../components/AccessDenied";
import { BlankCcurseView } from "../components/BlankStates";
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

  function handleViewSession(sessionId) {
    navigate("/session", {
      state: {
        name: location.state.name,
        permission: location.state.permission,
        email: location.state.email,
        sessionId: sessionId,
        sectionId: location.state.sectionId,
        courseName: location.state.courseName,
        passcode: location.state.passcode,
        semester: location.state.semester,
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

  async function populateSessionCards(role) {
    let courseSessions;
    await axios
      .get(`${server}/course/${location.state.sectionId}`)
      .then((res) => {
        courseSessions = res.data.data.sessions;
      })
      .catch((err) => console.log(err));

    let sessionList = [];

    for (let weekNum in courseSessions) {
      if (courseSessions[weekNum].length === 0) {
        continue;
      }
      let weeklabel = getWeekLabel(weekNum);
      if (weekNum === getWeekNumber()) weeklabel = "This week";
      else if (weekNum === getWeekNumber(-1)) weeklabel = "Last Week";

      let weekSessions = [];
      for (let i in courseSessions[weekNum]) {
        let session = courseSessions[weekNum][i];
        weekSessions.push(
          <SessionCard
            key={i}
            title={session.name}
            active={session.active}
            onClick={() => handleViewSession(i)}
          />
        );
      }
      sessionList.push(
        <Container className="card-container" key={weekNum}>
          <h3 className="card-title divisor">{weeklabel}</h3>
          {weekSessions}
        </Container>
      );
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
          },
        })
      }
    />
  );

  function studentContent() {
    const [sessionOpen, setSessionOpen] = useState(false);
    return (
      <div className="card-title d-flex justify-content-center align-items-center p-5 gap-5">
        <Overlay
          title="Join Session"
          id="join-session"
          content={JoinSession()}
        />
        {backButton}
        {sessionOpen ? (
          "Open"
        ) : (
          <div className="m-5 p-5 gap-4 d-flex flex-column align-items-center">
            <div className="blank-state-msg">
              Hmm... It seems your instructor has not started a session yet.
            </div>
            <Button
              variant="blank-state"
              className="large-title"
              onClick={() => {
                window.location.reload();
              }}
            >
              Refresh
            </Button>
          </div>
        )}
      </div>
    );
  }

  function instructorContent() {
    const [cards, setCards] = useState(<BlankCcurseView />);

    useEffect(() => {
      const container = document.getElementById("semester-container");
      async function loadContent() {
        const sessionList = await populateSessionCards("INSTRUCTOR");
        container.style.opacity = 0;
        await pause();
        setCards(sessionList);
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
            content={
              <CreateSession
                sectionId={location.state.sectionId}
                refresh={refresh}
                setRefresh={setRefresh}
              />
            }
          />
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
