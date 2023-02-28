import PollCard from "../components/PollCard";
import { Poll } from "../components/Popups";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import Container from "react-bootstrap/Container";

function SessionView(props) {

  function openPopup(id) {
    console.log("opened", id);
    document.body.style.overflow = "hidden";
    const overlay1 = document.getElementById(id);
    overlay1.querySelector(".overlay-bg").style.pointerEvents = "all";
    overlay1.querySelector(".overlay-bg").style.opacity = 100;
    overlay1.querySelector(".pop-up").style.opacity = 100;
    overlay1.style.height = "100vh";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Menu />
      <MenuBar title="Course Name" description="Course Description" />
      <Overlay id="Poll 1" title="Poll 1" content={Poll} />
      <Container className="poll-card-container">
        <PollCard title="Poll 1" />
        <PollCard title="Poll 2" />
        <PollCard title="Poll 1" />
        <PollCard title="Poll 2" />
        <PollCard title="Poll 1" />
        <PollCard title="Poll 2" />
        <PollCard title="Poll 1" />
        <PollCard title="Poll 2" />
      </Container>
    </div>
  );
}

export default SessionView;
