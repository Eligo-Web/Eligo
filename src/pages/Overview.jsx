// Eligo is a web application primarily used for in-class polls.
// Copyright (C) 2023  Eligo-Web <smodare1@jhu.edu> <ffernan9@jhu.edu>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import { useLocation, useNavigate } from "react-router-dom";
import { server } from "../ServerUrl";
import AccessDenied from "../components/AccessDenied";
import {
  EmptyOverview,
  InstructorScreenAlert,
  LoadingOverview,
} from "../components/BlankStates";
import { FloatingButton } from "../components/Buttons";
import Card from "../components/Card";
import * as clicker from "../components/ClickerBase";
import Menu from "../components/Menu";
import MenuBar from "../components/MenuBar";
import Overlay from "../components/Overlay";
import pause, {
  openPopup,
  reconnectBase,
  sessionValid,
} from "../components/Utils";
import {
  ClickerContext,
  GlobalPopupContext,
} from "../containers/InAppContainer";
import "../styles/cards.css";
import "../styles/overlay.css";

function OverView() {
  const location = useLocation();
  const navigate = useNavigate();
  const authorized = location.state && location.state.permission;
  const [refresh, setRefresh] = useState(false);
  const [cards, setCards] = useState(<LoadingOverview />);
  const [base, setBase] = useContext(ClickerContext);
  const [globalPopup, setGlobalPopup] = useContext(GlobalPopupContext);
  const [loaded, setLoaded] = useState(false);
  if (location.state && !authorized && !location.state.unauthorized) {
    loadUser();
  }

  async function loadUser() {
    const role = sessionStorage.getItem("role").toLowerCase();
    await axios
      .get(`${server}/${role}/current-user`)
      .then((res) => {
        const user = res.data.data;
        navigate("/overview", {
          state: {
            permission: user.role,
            email: user.email,
            name: user.name,
            history: user.history,
            clickerId: user.clickerId,
          },
        });
      })
      .catch(() => {
        navigate("/overview", {
          state: {
            unauthorized: true,
          },
        });
      });
  }

  async function loadBase() {
    let newBase = await clicker.openDevice();
    if (newBase && !base) {
      setBase(await clicker.initialize(newBase));
    }
  }

  if (navigator.hid && base) {
    navigator.hid.ondisconnect = ({ device }) => {
      if (device.vendorId === 0x1881) {
        setBase(null);
      }
    };
  }

  useEffect(() => {
    if (!navigator.hid) return;
    reconnectBase(setBase);
  }, []);

  useEffect(() => {
    setGlobalPopup(null);
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
        classPasscode: passcode,
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
      .catch((err) => {
        if (!sessionValid(err.response, setGlobalPopup)) return;
      });
    if (!history) return;
    const semesterList = [];

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
            const popup = (
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
                onEdit={() => setGlobalPopup(popup)}
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
          })
          .catch((err) => {
            if (!sessionValid(err.response, setGlobalPopup)) return;
          });
      }
      semesterList.push(
        <Container className="card-container" key={semester}>
          <h3 className="card-title divisor">{semester}</h3>
          {courseList}
        </Container>
      );
    }
    if (!semesterList.length) {
      return null;
    }
    return semesterList;
  }

  async function loadContent(role) {
    const container = document.querySelector(".semester-container");
    const semesterList = await populateCourseCards(role);
    await pause(250);
    container.style.opacity = 0;
    await pause(150);
    setCards(semesterList);
    container.style.opacity = 1;
    container.style.pointerEvents = "all";
    setLoaded(true);
  }

  function studentContent() {
    useEffect(() => {
      loadContent("STUDENT");
    }, [refresh]);

    useEffect(() => {
      if (globalPopup) {
        openPopup(globalPopup.key);
      }
    }, [globalPopup]);

    return (
      <div className={cards ? "" : "d-flex fill-centered"}>
        {globalPopup}
        {cards ? null : <EmptyOverview student />}
        <div className="semester-container">{cards}</div>
      </div>
    );
  }

  function instructorContent() {
    useEffect(() => {
      loadContent("INSTRUCTOR");
    }, [refresh]);

    useEffect(() => {
      if (globalPopup) {
        openPopup(globalPopup.key);
      }
    }, [globalPopup]);

    return (
      <div style={{ height: "100%" }}>
        <InstructorScreenAlert />
        {globalPopup}
        {cards ? null : <EmptyOverview />}
        <div className="semester-container">{cards}</div>
      </div>
    );
  }

  return !authorized ? (
    <AccessDenied />
  ) : (
    <div>
      <title>Your Courses | Eligo</title>
      {location.state.permission === "STUDENT"
        ? null
        : loaded && (
            <FloatingButton base={base} onClick={() => loadBase()} bottom />
          )}
      <div className="overview-wrapper">
        <Menu
          popup={
            location.state.permission === "STUDENT" ? (
              <Overlay
                key="join-class"
                title="Join Class"
                id="join-class"
                refresh={refresh}
                setRefresh={setRefresh}
                state={location.state}
                joinClass
              />
            ) : (
              <Overlay
                key="create-class"
                title="New Class"
                id="create-class"
                refresh={refresh}
                setRefresh={setRefresh}
                createClass
              />
            )
          }
        />
        <MenuBar
          title="Your Courses"
          description={location.state.email}
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
