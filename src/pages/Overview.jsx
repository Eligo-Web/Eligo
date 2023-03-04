import Card from "../components/Card";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import Container from "react-bootstrap/Container";
import { useLocation, useNavigate } from "react-router-dom";
import { JoinClass, CreateClass } from "../components/Popups";
import "../styles/overlay.css";
import "../styles/cards.css";

function OverView(props) {
  const location = useLocation();
  const navigate = useNavigate();
  function handleViewClass(className, classId) {
    navigate("/class", {
      state: {
        permission: location.state.permission,
        email: location.state.email,
        className: className,
        classId: classId,
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
        </Container>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Menu />
      <MenuBar
        title="Your Courses"
        description={location.state.email}
        onClick={props.onClick}
      />
      {location.state.permission === "student"
        ? studentContent()
        : instructorContent()}
    </div>
  );
}

export default OverView;
