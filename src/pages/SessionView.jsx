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
      let title = `Poll ${i + 1}`;
      cards.push(<PollCard title={title} key={title} />);
    }
    return cards;
  }
  function renderOverlays() {
    let overlays = [];
    for (let i = 0; i < 10; i++) {
      let title = `Poll ${i + 1}`;
      overlays.push(<Overlay title={title} content={Poll(title, "A")} key={title} />);
    }
    return overlays;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Menu />
      <MenuBar title="Course Name" description="Course Description" />
      {renderOverlays()}
      <Container className="poll-card-container">{renderPollCards()}</Container>
    </div>
  );
}

export default SessionView;
