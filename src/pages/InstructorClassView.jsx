import Container from "react-bootstrap/Container";
import { IoMdAddCircleOutline } from "react-icons/io";

import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import SessionCard from "../components/SessionCard";
import IconButton from "../components/Buttons/IconButton";

function InstructorClassView(props) {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Menu />
        <MenuBar title="Course Name" description="Course Code" onClick={props.onClick} />
        <Container className="session-card-container">
          <SessionCard title="Session 1" activity="Active"/>
          <SessionCard title="Session 2" activity="Inactive"/>
          <SessionCard title="Session 3" activity="Inactive"/>
        </Container>
        <div className="position-absolute bottom-0 end-0 p-4">
          <IconButton
            label="Create Session"
            icon={<IoMdAddCircleOutline size="2rem" />}
          />
        </div>
      </div>
    );
  }
  
  export default InstructorClassView;