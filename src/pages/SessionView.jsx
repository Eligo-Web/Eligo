import PollCard from "../components/PollCard";
import { Poll } from "../components/Popups";
import { useNavigate, useLocation } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { BackButton, IconButton } from "../components/Buttons";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useState } from "react";
import AccessDenied from "../components/AccessDenied";
import { useEffect } from "react";
import axios from "axios";

function SessionView(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const authorized = location.state && location.state.permission;

  useEffect(() => {
    if (location.state && location.state.permission === "STUDENT") {
      checkActiveSession();
    }
    if (
      navigator.userAgent.indexOf("Safari") != -1 &&
      navigator.userAgent.indexOf("Chrome") == -1
    ) {
      if (document.querySelectorAll(".poll-card")) {
        document.querySelectorAll(".poll-card").forEach((card) => {
          card.style.backgroundColor = "#c8e2fb";
        });
      }
    }
  }, []);

  async function checkActiveSession() {
    const server = "http://localhost:3000";
    console.log(location.state);
    await axios
      .get(
        `${server}/course/${location.state.sectionId}/
         ${location.state.weekNum}/${location.state.sessionId}`
      )
      .then((res) => {
        if (!res.data.data.active) {
          navigateBack();
        }
      })
      .catch((err) => console.log(err));
  }

  async function closeSession() {
    const server = "http://localhost:3000";
    await axios
      .put(
        `${server}/course/${location.state.sectionId}/
         ${location.state.weekNum}/${location.state.sessionId}/close`
      )
      .then((res) => {})
      .catch((err) => console.log(err));
    navigateBack();
  }

  function navigateBack() {
    console.log(location.state);
    navigate("/class", {
      state: {
        name: location.state.name,
        permission: location.state.permission,
        email: location.state.email,
        courseName: location.state.courseName,
        sectionId: location.state.sectionId,
        passcode: location.state.classPasscode,
      },
    });
  }

  function navigateOverview() {
    navigate("/overview", {
      state: {
        name: location.state.name,
        permission: location.state.permission,
        email: location.state.email,
      },
    });
  }
  let pollId = "";
  function checkActivePoll() {
    const server = "http://localhost:3000";
    axios
      .get(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}/openPoll`
      )
      .then((res) => {
        if (res.data.data) {
          setPollOpen(true);
          pollId = res.data.data.activePollId;
        }
      })
      .catch((err) => console.log(err));
  }

  function studentContent() {
    const [pollOpen, setPollOpen] = useState(false);
    return (
      <div className="card-wrapper">
        <Menu />
        <MenuBar
          title={location.state.sessionName}
          description={location.state.passcode}
          clickable
        />
        <BackButton label="Overview" onClick={() => navigateOverview()} />
        {pollOpen ? (
          <Poll
            sectionId={location.state.sectionId}
            weekNum={location.state.weekNum}
            sessionId={location.state.sessionId}
            pollId={pollId}
            email={location.state.email}
          />
        ) : (
          <div className="m-5 p-5 gap-4 d-flex flex-column align-items-center">
            <div className="blank-state-msg">
              Your instructor has no open polls right now.
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
    return (
      <div className="card-wrapper">
        <Menu hideCreate />
        <MenuBar
          title={location.state.sessionName}
          description={location.state.passcode}
          clickable
          showDescription
        />
        <BackButton
          label={location.state.courseName}
          onClick={() => navigateBack()}
        />
        <Container className="poll-card-container" style={{ paddingBottom: 0 }}>
          <h3 className="card-title divisor">Active Poll</h3>
        </Container>
        <Container className="poll-card-container">
          <PollCard title="Poll 1" key="Poll 1" />
        </Container>
        <Container className="poll-card-container" style={{ paddingBottom: 0 }}>
          <h3 className="card-title divisor">Inactive Polls</h3>
        </Container>
        <Container className="poll-card-container">
          {renderPollCards(7)}
        </Container>
        <div className="courses-bottom-row bottom-0 gap-3">
          <IconButton
            label="Create Poll"
            icon={<IoMdAddCircleOutline size="1.7em" />}
            style={{ maxWidth: "max-content" }}
            onClick={() => createPoll()}
          />
          <div className="row gap-3 p-3">
            {location.state.sessionActive ? (
              <IconButton
                label="Close Session"
                variant="outline"
                style={{ maxWidth: "max-content" }}
                onClick={() => closeSession()}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  function renderPollCards(num) {
    let cards = [];
    for (let i = 2; i <= num; i++) {
      let title = `Poll ${i}`;
      cards.push(<PollCard title={title} key={title} disabled />);
    }
    return cards;
  }

  function renderOverlays(num) {
    let overlays = [];
    for (let i = 1; i <= num; i++) {
      let title = `Poll ${i}`;
      overlays.push(
        <Overlay title={title} content={Poll(title)} key={title} />
      );
    }
    return overlays;
  }

  async function createPoll() {
    const server = "http://localhost:3000";
    const newPollId = `poll-${Date.now()}`;
    await axios
      .post(`${server}/course/${
        location.state.sectionId}/${
        location.state.weekNum}/${
        location.state.sessionId}/${newPollId}`)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
    const popup = window.open(
      "/newpoll",
      "test",
      "toolbar=no, location=no, statusbar=no, \
       menubar=no, scrollbars=0, width=250, \
       height=100, top=110, left=1040"
    );
    // communicate with window
  }

  return !authorized ? (
    <AccessDenied />
  ) : (
    <div>
      {location.state.permission === "STUDENT"
        ? studentContent()
        : instructorContent()}
    </div>
  );
}

export default SessionView;
