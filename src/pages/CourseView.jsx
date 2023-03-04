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
import { IconDownload, IconList } from "@tabler/icons-react";

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
      <div className="d-flex flex-column ">
        <div className="card-wrapper">
          <Overlay title="Create Class" content={CreateClass()} />
          <Overlay title="Create Session" content={CreateSession()} />
          <div>
            <Container className="card-container">
              <h3 className="card-title divisor">Today</h3>
              <SessionCard
                title="Session 1"
                activity="Active"
                onClick={() => handleViewSession("Session 1")}
              />
              <SessionCard title="Session 2" activity="Inactive" />
              <SessionCard title="Session 3" activity="Inactive" />
              <SessionCard title="Session 4" activity="Inactive" />
              <SessionCard title="Session 5" activity="Inactive" />
              <SessionCard title="Session 6" activity="Inactive" />
              <SessionCard title="Session 7" activity="Inactive" />
            </Container>
            <Container className="card-container">
              <h3 className="card-title divisor">Yesterday</h3>
              <SessionCard title="Session 1" activity="Inactive" />
              <SessionCard title="Session 2" activity="Inactive" />
              <SessionCard title="Session 3" activity="Inactive" />
              <SessionCard title="Session 4" activity="Inactive" />
              <SessionCard title="Session 5" activity="Inactive" />
              <SessionCard title="Session 6" activity="Inactive" />
            </Container>
            <Container className="card-container">
              <h3 className="card-title divisor">Older</h3>
              <SessionCard title="Session 1" activity="Inactive" />
              <SessionCard title="Session 2" activity="Inactive" />
              <SessionCard title="Session 2" activity="Inactive" />
            </Container>
            <Container className="card-container">
              <h3 className="card-title divisor">Older</h3>
              <SessionCard title="Session 1" activity="Inactive" />
              <SessionCard title="Session 2" activity="Inactive" />
            </Container>
            <Container className="card-container">
              <h3 className="card-title divisor">Older</h3>
              <SessionCard title="Session 1" activity="Inactive" />
              <SessionCard title="Session 2" activity="Inactive" />
            </Container>
          </div>
        </div>
        <div className="menu-bar-items courses-bottom-row bottom-0 gap-3">
          <div className="row gap-3 p-3">
            <IconButton
              label="Download Class Data"
              icon={<IconDownload size="2rem" />}
              variant="outline"
              style={{ maxWidth: "max-content" }}
            />
            <IconButton
              label="View Roster"
              icon={<IconList size="2rem" />}
              variant="outline"
              style={{ maxWidth: "max-content" }}
            />
          </div>
          <IconButton
            label="Create Session"
            icon={<IoMdAddCircleOutline size="2rem" />}
            onClick={() => openPopup("Create Session")}
            style={{ maxWidth: "max-content", zIndex: 5 }}
          />
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
