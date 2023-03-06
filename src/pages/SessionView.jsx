import PollCard from "../components/PollCard";
import { CreateClass, InstructorPoll, Poll } from "../components/Popups";
import { useNavigate, useLocation } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay, { openPopup } from "../components/Overlay";
import Container from "react-bootstrap/Container";
import { IconButton } from "../components/Buttons";
import { IoMdAddCircleOutline } from "react-icons/io";

function SessionView(props) {
  const location = useLocation();
  const navigate = useNavigate();
  function studentContent() {
    return <p></p>;
  }
  function instructorContent() {
    return (
      <div className="card-wrapper">
        <Menu />
        <MenuBar
          title={location.state.sessionId}
          description={location.state.sectionId}
          clickable={true}
          showDescription={true}
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
            onClick={() => {}}
            style={{ maxWidth: "max-content" }}
          />
        </div>
      </div>
    );
  }
  function renderPollCards(num) {
    let cards = [];
    for (let i = 2; i <= num; i++) {
      let title = `Poll ${i}`;
      cards.push(<PollCard title={title} key={title} disabled={true} />);
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
  return (
    <div>
      {location.state.permission === "student"
        ? studentContent()
        : instructorContent()}
    </div>
  );
}

export default SessionView;
