import { useEffect } from "react";
import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import img from "../assets/empty-session-state.png";
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

export function BlankOverview() {
  return (
    <Container className="card-container loading">
      <div className="card-title divisor-blank"></div>
      {Array.from(Array(8), (_, i) => (
        <Card key={i} />
      ))}
    </Container>
  );
}

export function BlankCourseView() {
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
    <Container>
      <div className="img-container">
        <img className="empty-state-img" src={img} />
        <center className="blank-state-msg">
          No sessions found. Create a session and it will appear here.
        </center>
      </div>
    </Container>
  );
}

export function BlankSessionView() {
  return (
    <Container className="poll-card-container loading">
      <div className="card-title divisor-blank"></div>
      {Array.from(Array(12), (_, i) => (
        <PollCard blank key={i} />
      ))}
    </Container>
  );
}

export function EmptySessionView() {
  useEffect(() => {
    async function fadeIn() {
      await pause(250);
      const img = document.querySelector(".img-container");
      if (img) img.style.opacity = 1;
    }
    fadeIn();
  }, []);
  return (
    <Container>
      <div className="img-container">
        <img className="empty-state-img" src={img} />
        <center className="blank-state-msg">
          You have created no polls yet. Create some and they will appear here!
        </center>
      </div>
    </Container>
  );
}
