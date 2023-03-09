import Card from "../components/Card";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import Container from "react-bootstrap/Container";
import { useLocation, useNavigate } from "react-router-dom";
import { JoinClass, CreateClass, EditClass } from "../components/Popups";
import "../styles/overlay.css";
import "../styles/cards.css";
import AccessDenied from "../components/AccessDenied";
import { useEffect } from "react";

function OverView(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const authorized = location.state && location.state.permission;

  useEffect(() => {
    if (
      navigator.userAgent.indexOf("Safari") != -1 &&
      navigator.userAgent.indexOf("Chrome") == -1
    ) {
      if (document.querySelectorAll(".card")) {
        document.querySelectorAll(".card").forEach((card) => {
          card.style.backgroundColor = "#c8e2fb";
        });
      }
    }
  }, []);

  function handleViewClass(courseName, sectionId) {
    navigate("/class", {
      state: {
        permission: location.state.permission,
        email: location.state.email,
        courseName: courseName,
        sectionId: sectionId,
      },
    });
  }

  function studentContent() {
    return (
      <div style={{ marginBottom: "5rem" }}>
        <Overlay title="Join Class" content={JoinClass()} />
        <Container className="card-container">
          <Card
            title="Computer System Fundamentals"
            instructor="Dave Hovemeyer"
            id="EN.601.229"
            onClick={() =>
              handleViewClass("Computer System Fundamentals", "EN.601.229")
            }
          />
          <Card />
          <Card />
          <Card />
          <Card />
        </Container>
      </div>
    );
  }
  function instructorContent() {
    return (
      <div style={{ marginBottom: "5rem" }}>
        <Overlay title="Create Class" content={CreateClass()} />
        <Overlay title="Edit Class" content={EditClass()} />
        <div>
          <Container className="card-container">
            <h3 className="card-title divisor">Spring 2023</h3>
            <Card
              title="Computer System Fundamentals"
              instructor="Dave Hovemeyer"
              id="EN.601.229"
              onClick={() => {
                handleViewClass("Computer System Fundamentals", "EN.601.229");
              }}
              editable
            />
            <Card editable />
            <Card editable />
            <Card editable />
            <Card editable />
          </Container>
          <Container className="card-container">
            <h3 className="card-title divisor">Fall 2022</h3>
            <Card editable />
            <Card editable />
            <Card editable />
            <Card editable />
            <Card editable />
          </Container>
          <Container className="card-container">
            <h3 className="card-title divisor">Spring 2022</h3>
            <Card editable />
            <Card editable />
            <Card editable />
            <Card editable />
            <Card editable />
          </Container>
        </div>
      </div>
    );
  }
  if (window.innerWidth < 600 && location.state.permission === "instructor") {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div
          className="d-flex flex-column align-items-center"
          style={{ width: "95%", paddingTop: "5rem" }}
        >
          <div className="blank-state-msg">
            Please sign in on a desktop device to use Edupoll as an instructor.
          </div>
        </div>
      </div>
    );
  }
  return !authorized ? (
    <AccessDenied />
  ) : (
    <div className="overview-wrapper">
      <Menu />
      <MenuBar
        title="Your Courses"
        description={location.state.email}
        onClick={props.onClick}
        clickable={false}
        showDescription
      />
      {location.state.permission === "student"
        ? studentContent()
        : instructorContent()}
    </div>
  );
}

export default OverView;
