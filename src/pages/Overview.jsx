import Card from "../components/Card";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import Container from "react-bootstrap/Container";
import { useLocation, useNavigate } from "react-router-dom";
import AccessDenied from "../components/AccessDenied";
import { BlankOverview } from "../components/BlankStates";
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/overlay.css";
import "../styles/cards.css";

function OverView(props) {
  const server = "http://localhost:3000";
  const location = useLocation();
  const navigate = useNavigate();
  const authorized = location.state && location.state.permission;
  const [refresh, setRefresh] = useState(false);
  const [cards, setCards] = useState(<BlankOverview />);
  const [overlays, setOverlays] = useState(null);

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

  function pause() {
    return new Promise((res) => setTimeout(res, 250));
  }

  function handleViewClass(courseName, sectionId, semester, passcode) {
    console.log(location.state);
    navigate("/class", {
      state: {
        name: location.state.name,
        permission: location.state.permission,
        email: location.state.email,
        courseName: courseName,
        sectionId: sectionId,
        passcode: passcode,
        semester: semester,
      },
    });
  }

  async function populateCourseCards(role) {
    let history;
    await axios
      .get(`${server}/${role.toLowerCase()}/${location.state.email}`)
      .then((res) => {
        history = res.data.data.history;
      })
      .catch((err) => console.log(err));

    const semesterList = [];
    const editOverlays = [];

    for (let semester in history) {
      if (history[semester].length === 0) {
        continue;
      }
      history[semester].sort();
      const courseList = [];
      for (let i in history[semester]) {
        await axios
          .get(`${server}/course/${history[semester][i]}`)
          .then((res) => {
            const course = res.data.data;
            courseList.push(
              <Card
                key={course.sectionId}
                id={course.sectionId}
                title={course.name}
                instructor={course.instructor.name || "No Instructor"}
                sisId={
                  course.SISId
                    ? `${course.SISId} (${course.section})`
                    : `Section ${course.section}`
                }
                onClick={() => {
                  handleViewClass(
                    course.name,
                    course.sectionId,
                    course.semester,
                    course.passcode
                  );
                }}
                editable={role === "INSTRUCTOR"}
              />
            );
            editOverlays.push(
              <Overlay
                key={course.sectionId}
                id={course.sectionId}
                title="Edit Class"
                childContent={course}
                refresh={refresh}
                setRefresh={setRefresh}
                instructor
                editMode
              />
            );
          })
          .catch((err) => console.log(err));
      }
      semesterList.push(
        <Container className="card-container" key={semester}>
          <h3 className="card-title divisor">{semester}</h3>
          {courseList}
        </Container>
      );
    }
    return [semesterList.reverse(), editOverlays];
  }

  function studentContent() {
    useEffect(() => {
      const container = document.getElementById("semester-container");
      async function loadContent() {
        const semesterList = (await populateCourseCards("STUDENT"))[0];
        container.style.opacity = 0;
        await pause();
        setCards(semesterList);
        container.style.opacity = 100;
      }
      loadContent();
    }, [refresh]);
    return (
      <div style={{ marginBottom: "5rem" }}>
        <Overlay
          title="Join Class"
          id="Join Class"
          refresh={refresh}
          setRefresh={setRefresh}
          state={location.state}
          joinClass
        />
        <div id="semester-container" className="semester-container">
          {cards}
        </div>
      </div>
    );
  }

  function instructorContent() {
    useEffect(() => {
      const container = document.getElementById("semester-container");
      async function loadContent() {
        const [semesterList, editOverlays] = await populateCourseCards(
          "INSTRUCTOR"
        );
        container.style.opacity = 0;
        await pause();
        setCards(semesterList.reverse());
        container.style.opacity = 100;
        setOverlays(editOverlays);
      }
      loadContent();
    }, [refresh]);

    return (
      <div style={{ marginBottom: "5rem" }}>
        <Overlay
          title="New Class"
          id="Create Class"
          refresh={refresh}
          setRefresh={setRefresh}
          instructor
        />
        {overlays}
        <div id="semester-container" className="semester-container">
          {cards}
        </div>
      </div>
    );
  }
  if (window.innerWidth < 600 && location.state.permission === "INSTRUCTOR") {
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
        showDescription
      />
      {location.state.permission === "STUDENT"
        ? studentContent()
        : instructorContent()}
    </div>
  );
}

export default OverView;
