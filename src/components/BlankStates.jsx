import { useEffect } from "react";
import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import emptyCourseImg from "../assets/empty-course-state.png";
import emptyOverviewImg from "../assets/empty-overview-state.png";
import emptySessionImg from "../assets/empty-session-state.png";
import { pause } from "../pages/CourseView";
import "../styles/images.css";
import Card from "./Card";
import PollCard from "./PollCard";
import SessionCard from "./SessionCard";

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
          onClick={() => navigate("/signin")}
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
      <div className="card-title divisor-blank"></div>
      {Array.from(Array(8), (_, i) => (
        <Card key={i} />
      ))}
    </Container>
  );
}

export function EmptyOverview(props) {
  useEffect(() => {
    async function fadeIn() {
      await pause(250);
      const img = document.querySelector(".img-container");
      if (img) img.style.opacity = 1;
    }
    fadeIn();
  }, []);
  return (
    <div className="d-flex" style={{ paddingTop: "4rem" }}>
      <div className="img-container">
        <img
          className="empty-state-img"
          src={emptyOverviewImg}
          alt="No Courses"
        />
        <center className="blank-state-msg p-2">
          {props.student
            ? "You jave not joined a class yet. Join one and it will appear here."
            : "You have no classes yet. As you create them, they will appear here."}
        </center>
      </div>
    </div>
  );
}

export function LoadingCourseView() {
  return (
    <Container className="card-container loading">
      <div className="card-title divisor-blank"></div>
      {Array.from(Array(12), (_, i) => (
        <SessionCard blank key={i} />
      ))}
    </Container>
  );
}

export function EmptyCourseView() {
  useEffect(() => {
    async function fadeIn() {
      await pause(250);
      const img = document.querySelector(".img-container");
      if (img) img.style.opacity = 1;
    }
    fadeIn();
  }, []);
  return (
    <div className="img-container">
      <img className="empty-state-img" src={emptyCourseImg} alt="No sessions" />
      <center className="blank-state-msg p-2">
        This class has no sessions. Create a session and it will appear here.
      </center>
    </div>
  );
}

export function LoadingSessionView() {
  return (
    <Container className="poll-card-container loading">
      <div className="card-title divisor-blank"></div>
      {Array.from(Array(12), (_, i) => (
        <PollCard blank key={i} />
      ))}
    </Container>
  );
}

export function EmptySessionView(props) {
  useEffect(() => {
    async function fadeIn() {
      await pause(250);
      const img = document.querySelector(".img-container");
      if (img) img.style.opacity = 1;
    }
    fadeIn();
  }, []);
  return (
    <div className="img-container">
      <img className="empty-state-img" src={emptySessionImg} alt="No polls" />
      <center className="blank-state-msg p-2">
        {props.open
          ? "You have created no polls yet. Create some and they will appear here!"
          : "This session has no polls to show."}
      </center>
    </div>
  );
}
