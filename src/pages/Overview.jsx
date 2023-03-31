import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import { useLocation, useNavigate } from "react-router-dom";
import AccessDenied from "../components/AccessDenied";
import { EmptyOverview, LoadingOverview } from "../components/BlankStates";
import { FloatingButton } from "../components/Buttons";
import Card from "../components/Card";
import * as clicker from "../components/ClickerBase";
import Menu from "../components/Menu";
import MenuBar from "../components/MenuBar";
import Overlay from "../components/Overlay";
import { ClickerContext } from "../containers/InAppContainer";
import "../styles/cards.css";
import "../styles/overlay.css";
import { pause } from "./CourseView";

function OverView(props) {
  const server = "http://localhost:3000";
  const location = useLocation();
  const navigate = useNavigate();
  const authorized = location.state && location.state.permission;
  const [refresh, setRefresh] = useState(false);
  const [cards, setCards] = useState(<LoadingOverview />);
  const [overlays, setOverlays] = useState(null);
  const [base, setBase] = useContext(ClickerContext);

  async function loadBase() {
    let newBase = await clicker.openDevice();
    if (newBase && !base) {
      setBase(await clicker.initialize(newBase));
    }
  }

  if (base) {
    navigator.hid.ondisconnect = ({ device }) => {
      if (device.vendorId === 0x1881) {
        setBase(null);
      }
    };
  }

  useEffect(() => {
    async function reconnectBase() {
      const devices = await navigator.hid.getDevices();
      if (devices.length && !devices[0].opened) {
        const device = devices[0];
        setBase(device);
        try {
          await device.open();
        } catch (err) {
          console.log(err);
        }
        console.log(device.opened);
      }
    }
    reconnectBase();
  }, []);

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

  async function handleViewClass(courseName, sectionId, semester, passcode) {
    navigate("/class", {
      state: {
        name: location.state.name,
        permission: location.state.permission,
        email: location.state.email,
        courseName: courseName,
        sectionId: sectionId,
        passcode: passcode,
        semester: semester,
        clickerId: location.state.clickerId,
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
                editClass
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
    if (!semesterList.length) return [null, null];
    return [semesterList, editOverlays];
  }

  function studentContent() {
    useEffect(() => {
      const container = document.querySelector(".semester-container");
      async function loadContent() {
        const semesterList = (await populateCourseCards("STUDENT"))[0];
        await pause(250);
        container.style.opacity = 0;
        await pause(100);
        setCards(semesterList);
        container.style.opacity = 1;
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
        {cards ? null : <EmptyOverview student />}
        <div className="semester-container">{cards}</div>
      </div>
    );
  }

  function instructorContent() {
    useEffect(() => {
      const container = document.querySelector(".semester-container");
      async function loadContent() {
        const [semesterList, editOverlays] = await populateCourseCards(
          "INSTRUCTOR"
        );
        await pause(250);
        container.style.opacity = 0;
        await pause(100);
        setCards(semesterList);
        container.style.opacity = 1;
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
          createClass
        />
        {overlays}
        {cards ? null : <EmptyOverview />}
        <div className="semester-container">{cards}</div>
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
    <div>
      {location.state.permission === "STUDENT" ? null : (
        <FloatingButton base={base} onClick={() => loadBase()} bottom />
      )}
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
    </div>
  );
}

export default OverView;
