import PollCard from "../components/PollCard";
import { Poll } from "../components/Popups";
import { useNavigate, useLocation } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import Container from "react-bootstrap/Container";
import { IconButton } from "../components/Buttons";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useState } from "react";
import AccessDenied from "../components/AccessDenied";

function SessionView(props) {
  const location = useLocation();
  const navigate = useNavigate();

  function studentContent() {
    let sessionOpen = Date.now() % 2;
    return <div>{sessionOpen ? "Open" : "Not Open"}</div>;
  }

  function instructorContent() {
    return (
      <div className="card-wrapper">
        <Menu />
        <MenuBar
          title={location.state.sessionId}
          description={location.state.sectionId}
          clickable
          showDescription
        />
        {renderOverlays(10)}
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
          {renderPollCards(39)}
        </Container>
        <div className="courses-bottom-row bottom-0 gap-3">
          <IconButton
            label="Create Poll"
            icon={<IoMdAddCircleOutline size="2rem" />}
            onClick={() => createPoll()}
            style={{ maxWidth: "max-content" }}
          />
          <div className="row gap-3 p-3">
            <IconButton
              label="Close Session"
              variant="outline"
              style={{ maxWidth: "max-content" }}
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
        <Overlay title={title} content={Poll(title, "A")} key={title} />
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
  }
  return !location.state ? (
    <AccessDenied />
  ) : (
    <div>
      {location.state.permission === "student"
        ? studentContent()
        : instructorContent()}
    </div>
  );
}

export default SessionView;
