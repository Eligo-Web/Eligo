import Container from "react-bootstrap/Container";
import { IoMdAddCircleOutline } from "react-icons/io";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import SessionCard from "../components/SessionCard";
import { IconButton } from "../components/Buttons.jsx";
import Overlay from "../components/Overlay";
import { useNavigate, useLocation } from "react-router-dom";
import { CreateSession, JoinSession } from "../components/Popups";
import { openPopup } from "../components/Overlay";
import { IconArrowLeft, IconDownload, IconList } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "../styles/cards.css";
import AccessDenied from "../components/AccessDenied";

function CourseView(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const authorized = location.state && location.state.permission;
  const [buttonLabels, setLabels] = useState(window.innerWidth > 900);

  useEffect(() => {
    if (
      navigator.userAgent.indexOf("Safari") != -1 &&
      navigator.userAgent.indexOf("Chrome") == -1
    ) {
      if (document.querySelectorAll(".session-card")) {
        document.querySelectorAll(".session-card").forEach((card) => {
          card.style.backgroundColor = "#c8e2fb";
        });
      }
    }
  }, []);

  window.onresize = function () {
    if (window.innerWidth < 900) {
      setLabels(false);
    } else if (!buttonLabels) {
      setLabels(true);
    }
  };

  function handleViewSession(sessionId) {
    navigate("/session", {
      state: {
        name: location.state.name,
        permission: location.state.permission,
        email: location.state.email,
        sessionId: sessionId,
        courseName: location.state.courseName,
        sectionId: location.state.sectionId,
      },
    });
  }

  function studentContent() {
    const [sessionOpen, setSessionOpen] = useState(false);
    return (
      <div className="card-title d-flex justify-content-center align-items-center p-5 gap-5">
        <Overlay title="Join Session" content={JoinSession()} />
        {sessionOpen ? (
          "Open"
        ) : (
          <div className="m-5 p-5 gap-4 d-flex flex-column align-items-center">
            <div className="blank-state-msg">
              Hmm... It seems your instructor has not started a session yet.
            </div>
            <Button
              variant="blank-state"
              className="large-title"
              onClick={() => {
                window.location.reload();
              }}
            >
              Refresh
            </Button>
          </div>
        )}
      </div>
    );
  }

  function instructorContent() {
    return (
      <div className="d-flex flex-column ">
        <div className="card-wrapper">
          <Overlay title="Create Session" content={CreateSession()} />
          <div>
            <IconButton
              style={{
                padding: "1rem",
                paddingLeft: "1.5rem",
                color: "#000d1db3",
                fontWeight: "500",
              }}
              icon={<IconArrowLeft size="1.5em" />}
              label={"Overview"}
              variant="transparent"
              onClick={() =>
                navigate("/overview", {
                  state: {
                    name: location.state.name,
                    permission: location.state.permission,
                    email: location.state.email,
                  },
                })
              }
            />
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
        <div className="courses-bottom-row bottom-0 gap-3">
          <IconButton
            label="Create Session"
            icon={<IoMdAddCircleOutline size="1.7em" />}
            onClick={() => openPopup("Create Session")}
            style={{ maxWidth: "max-content" }}
          />
          <div className="row gap-3 p-3">
            <IconButton
              label={buttonLabels ? "Download Class Data" : null}
              icon={<IconDownload size="1.6em" />}
              variant="outline"
              style={{ maxWidth: "max-content" }}
            />
            <IconButton
              label={buttonLabels ? "View Roster" : null}
              icon={<IconList size="1.6em" />}
              variant="outline"
              style={{ maxWidth: "max-content" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return !authorized ? (
    <AccessDenied />
  ) : (
    <div>
      <Menu
        leaveAction={location.state.permission === "student"}
        hideCreate={location.state.permission === "instructor"}
      />
      <MenuBar
        title={location.state.courseName}
        description={location.state.sectionId}
        onClick={props.onClick}
        clickable
        showDescription={location.state.permission !== "student"}
      />
      {location.state.permission === "student"
        ? studentContent()
        : instructorContent()}
    </div>
  );
}

export default CourseView;
