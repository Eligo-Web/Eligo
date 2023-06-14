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

import { useEffect } from "react";
import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import emptyCourseImg from "../assets/empty-course-state.png";
import emptyOverviewImg from "../assets/empty-overview-state.png";
import emptySessionImg from "../assets/empty-session-state.png";
import "../styles/images.css";
import Card from "./Card";
import PollCard from "./PollCard";
import SessionCard from "./SessionCard";
import pause from "./Utils";

function waitForImg(container, img) {
  if (container) {
    const imgDiv = container.childNodes[0];
    imgDiv.style.background = `url(${img.src}) no-repeat`;
    container.style.opacity = 1;
  }
}

function fadeIn(imgSource) {
  pause(250).then(() => {
    const container = document.querySelector(".img-container");
    const img = new Image();
    img.onload = () => waitForImg(container, img);
    img.src = imgSource;
  });
}

export function PageNotFound() {
  const navigate = useNavigate();
  return (
    <div className="card-title d-flex justify-content-center align-items-center p-5 gap-5">
      <div
        className="m-5 p-5 gap-4 d-flex flex-column align-items-center"
        style={{ width: "60%" }}
      >
        <div className="blank-state-msg">Page Not Found</div>
        <Button
          variant="blank-state"
          className="large-title"
          onClick={() => navigate("/")}
        >
          Home
        </Button>
      </div>
    </div>
  );
}

export function LoadingOverview() {
  return (
    <Container className="card-container loading">
      <div className="card-title divisor-blank transparent" />
      {Array.from(Array(16), (_, i) => (
        <Card key={i} />
      ))}
    </Container>
  );
}

export function EmptyOverview(props) {
  useEffect(() => fadeIn(emptyOverviewImg), []);

  return (
    <div className="d-flex fill-centered">
      <div className="img-container">
        <div className="empty-state-img" alt="No Courses" />
        <center className="blank-state-msg p-2">
          {props.student
            ? "You have not joined a class yet. Join one and it will appear here."
            : "You have no classes yet. As you create them, they will appear here."}
        </center>
      </div>
    </div>
  );
}

export function LoadingCourseView() {
  return (
    <Container className="card-container loading">
      <div className="card-title divisor-blank" />
      {Array.from(Array(4), (_, i) => (
        <SessionCard blank key={i} />
      ))}
      <div className="card-title divisor-blank" />
      {Array.from(Array(12), (_, i) => (
        <SessionCard blank key={i + 4} />
      ))}
    </Container>
  );
}

export function EmptyCourseView() {
  useEffect(() => fadeIn(emptyCourseImg), []);

  return (
    <div className="img-container">
      <div className="empty-state-img" alt="No sessions" />
      <center className="blank-state-msg p-2">
        This class has no sessions. Create a session and it will appear here.
      </center>
    </div>
  );
}

export function LoadingSessionView() {
  return (
    <Container className="poll-card-container loading">
      <div className="card-title divisor-blank transparent"></div>
      {Array.from(Array(24), (_, i) => (
        <PollCard blank key={i} />
      ))}
    </Container>
  );
}

export function EmptySessionView(props) {
  useEffect(() => fadeIn(emptySessionImg), []);

  return (
    <div className="img-container">
      <div className="empty-state-img" alt="No polls" />
      <center className="blank-state-msg p-2">
        {props.open
          ? "You have created no polls yet. Create some and they will appear here!"
          : "This session has no polls to show."}
      </center>
    </div>
  );
}

export function InstructorScreenAlert() {
  const navigate = useNavigate();
  return (
    <div className="screen-alert-wrapper">
      <div className="card-subtitle screen-alert-text m-auto">
        Hmm... It seems we can't display everything on your screen. This can
        occur if you are on a mobile device. To improve your experience, try one
        of the following:
        <ul>
          <li>Rotate your screen</li>
          <li>Enlarge the current window</li>
          <li>Join from a desktop device</li>
        </ul>
      </div>
      <center className="m-auto">
        <Button
          variant="sign-in large-title"
          className="large-title"
          onClick={() => navigate("/")}
        >
          Home
        </Button>
      </center>
    </div>
  );
}
