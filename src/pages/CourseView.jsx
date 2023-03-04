import Container from "react-bootstrap/Container";
import { IoMdAddCircleOutline, IoIosDownload, IoIosList } from "react-icons/io";
import "../styles/cards.css";

import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import SessionCard from "../components/SessionCard";
import IconButton from "../components/Buttons/IconButton";
import Overlay from "../components/Overlay";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreateSession,
  CreateClass,
  JoinClass,
  JoinSession,
} from "../components/Popups";
import { openPopup } from "../components/Overlay";

function InstructorClassView(props) {
  const location = useLocation();
  const navigate = useNavigate();
  function handleViewSession(sessionId) {
    navigate("/session", {
      state: {
        permission: location.state.permission,
        email: location.state.email,
        sessionId: sessionId,
        classId: location.state.classId,
      },
    });
  }
  function studentContent() {
    return <Overlay title="Join Class" content={JoinClass()} />;
  }
  function instructorContent() {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Overlay title="Create Class" content={CreateClass()} />
        <Overlay title="Create Session" content={CreateSession()} />
        <Container className="card-container">
          <h3 className="card-title">Today</h3>
          <SessionCard
            title="Session 1"
            activity="Active"
            onClick={() => handleViewSession("Session 1")}
          />
          <SessionCard title="Session 2" activity="Inactive" />
          <SessionCard title="Session 3" activity="Inactive" />
          <SessionCard title="Session 4" activity="Inactive" />
          <h3 className="card-title">Yesterday</h3>
          <SessionCard title="Session 1" activity="Inactive" />
          <SessionCard title="Session 2" activity="Inactive" />
          <SessionCard title="Session 3" activity="Inactive" />
        </Container>
        <div className="position-absolute bottom-0 end-0 p-4">
          <IconButton
            label="Create Session"
            icon={<IoMdAddCircleOutline size="2rem" />}
            onClick={() => openPopup("Create Session")}
          />
        </div>
        <div className="position-absolute bottom-0 start-0 p-4 d-flex align-items-center flex-row gap-3">
          <IconButton
            label="Download Class Data"
            icon={<IoIosDownload size="2rem" />}
            variant="outline"
          />
          <div>
            <IconButton
              label="View Roster"
              icon={<IoIosList size="2rem" />}
              variant="outline"
            />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <Menu />
      <MenuBar
        title={location.state.className}
        description={location.state.classId}
        onClick={props.onClick}
      />
      {location.state.permission === "student"
        ? studentContent()
        : instructorContent()}
    </div>
  );
}

export default InstructorClassView;
