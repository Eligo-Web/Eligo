import PollCard from "../components/PollCard";
import { Poll } from "../components/Popups";
import { useNavigate, useLocation } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import Container from "react-bootstrap/Container";

function SessionView(props) {
  const location = useLocation();
  const navigate = useNavigate();
  function studentContent() {
    return <p></p>;
  }
  function instructorContent() {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Menu />
        <MenuBar
          title={location.state.sessionId}
          description={location.state.classId}
        />
        {renderOverlays()}
        <Container className="poll-card-container">
          {renderPollCards()}
        </Container>
      </div>
    );
  }
  function renderPollCards() {
    let cards = [];
    for (let i = 0; i < 10; i++) {
      let title = `Poll ${i + 1}`;
      cards.push(<PollCard title={title} key={title} />);
    }
    return cards;
  }
  function renderOverlays() {
    let overlays = [];
    for (let i = 0; i < 10; i++) {
      let title = `Poll ${i + 1}`;
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
