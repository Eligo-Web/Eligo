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
import { IconArrowLeft } from "@tabler/icons-react";

function SessionView(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const authorized = location.state && location.state.permission;

  useEffect(() => {
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

  function navigateBack() {
    navigate("/class", {
      state: {
        permission: location.state.permission,
        email: location.state.email,
        name: location.state.name,
        courseName: location.state.courseName,
        sectionId: location.state.sectionId,
        passcode: location.state.passcode,
      },
    });
  }

  function studentContent() {
    const [pollOpen, setPollOpen] = useState(false);
    return (
      <div className="card-title d-flex justify-content-center align-items-center p-5 gap-5">
        {pollOpen ? (
          "Open"
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
          title={location.state.sessionId}
          description={location.state.sectionId}
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
            <IconButton
              label="Close Session"
              variant="outline"
              style={{ maxWidth: "max-content" }}
              onClick={() => navigateBack()}
            />
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

  function createPoll() {
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
