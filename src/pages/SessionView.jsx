import PollCard from "../components/PollCard";
import { Poll } from "../components/Popups";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import Container from "react-bootstrap/Container";
import { IoIosArrowBack } from "react-icons/io";

function SessionView(props) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <MenuBar
        title="Course Name"
        description="Course Description"
        icon={<IoIosArrowBack size="2.3rem" />}
      />
      <Overlay title="Poll 1" content={Poll()} />
      <Container className="poll-card-container">
        <PollCard title="Poll 1" />
        <PollCard title="Poll 2" />
        <PollCard title="Poll 1" />
        <PollCard title="Poll 2" />
        <PollCard title="Poll 1" />
        <PollCard title="Poll 2" />
        <PollCard title="Poll 1" />
        <PollCard title="Poll 2" />
        <PollCard title="Poll 2" />
        <PollCard title="Poll 2" />
      </Container>
    </div>
  );
}

export default SessionView;
