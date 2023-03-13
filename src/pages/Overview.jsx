import Card from "../components/Card";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import Container from "react-bootstrap/Container";
import { useLocation, useNavigate } from "react-router-dom";
import { JoinClass } from "../components/Popups";
import { CreateClass, EditClass } from "../components/CreateOrEditClass";
import AccessDenied from "../components/AccessDenied";
import { createRoot } from 'react-dom/client';
import { useEffect } from "react";
import axios from "axios";
import "../styles/overlay.css";
import "../styles/cards.css";
import { render } from "react-dom";

function OverView(props) {
  const server = "http://localhost:3000";
  const location = useLocation();
  const navigate = useNavigate();
  const authorized = location.state && location.state.permission;
  const semesterList = [];

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

  async function populateCards() {
    const history = location.state.history;  

    for (let semester in history) {
      const courseList = [];

      for (let i in history[semester]) {
        await axios
          .get(`${server}/course/${history[semester][i]}`)
          .then((res) => {
            const course = res.data;
            courseList.push(
              <Card
                key={course.sectionId}
                title={course.name}
                instructor={location.state.name}
                sisId={course.SISId}
                onClick={() => {
                  handleViewClass(
                    course.name,
                    course.SISId
                  );
                }}
                editable
              />
            );
          })
          .catch((err) => console.log(err));
      }
      semesterList.push(
        <Container className="card-container" key={semester}>
          <h3 className="card-title divisor">{semester}</h3>
          {courseList.map((item) => {item})}
        </Container>
      )
    }
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
    populateCards();
    useEffect(() => {
      const root = createRoot(document.getElementById("semester-container"));
      root.render(semesterList.map((item) => {item}));
    })

    return (
      <div style={{ marginBottom: "5rem" }}>
        <Overlay title="Create Class" content={CreateClass()} />
        <Overlay title="Edit Class" content={EditClass()} />
        <div id="semester-container">
          <Container className="card-container">
            <h3 className="card-title divisor">Spring 2023</h3>
            <Card
              title="Computer System Fundamentals"
              instructor="Dave Hovemeyer"
              sisId="EN.601.229"
              onClick={() => {
                handleViewClass("Computer System Fundamentals", "EN.601.229");
              }}
              editable
            />
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
