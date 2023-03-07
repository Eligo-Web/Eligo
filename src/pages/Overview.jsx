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

function OverView(props) {
  const location = useLocation();
  const navigate = useNavigate();
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
      <div>
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
      <div>
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
      <center className="card-subtitle p-4">
        Please sign in on a desktop device to use Edupoll as an instructor.
      </center>
    );
  }
  return !location.state ? (
    <AccessDenied />
  ) : (
    <div style={{ display: "flex", flexDirection: "column" }}>
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
