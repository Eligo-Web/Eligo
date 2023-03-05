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
      <div className="card-wrapper">
        <Menu />
        <MenuBar
          title={location.state.sessionId}
          description={location.state.classId}
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
