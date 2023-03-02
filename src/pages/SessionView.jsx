import PollCard from "../components/PollCard";
import { Poll } from "../components/Popups";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import Container from "react-bootstrap/Container";

function SessionView(props) {
  function renderPollCards() {
    let cards = [];
    for (let i = 0; i < 10; i++) {
      cards.push(<PollCard title={`Poll ${i + 1}`} />);
    }
    return cards;
  }
  function renderOverlays() {
    let overlays = [];
    for (let i = 0; i < 10; i++) {
      overlays.push(<Overlay title={`Poll ${i + 1}`} content={Poll()} />);
    }
    return overlays;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Menu />
      <MenuBar title="Course Name" description="Course Description" />
      {renderOverlays()}
      <Container className="poll-card-container">
        {renderPollCards()}
      </Container>
    </div>
  );
}

export default SessionView;
