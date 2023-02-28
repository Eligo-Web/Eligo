import Card from "../components/Card";
import MenuBar from "../components/MenuBar";
import SessionCard from "../components/SessionCard";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import "../styles/overlay.css";
import Container from "react-bootstrap/Container";
import { JoinOrCreate, Poll } from "../components/Popups";
import "../styles/containers.css";

function CourseView(props) {
  console.log(window.innerWidth);
  if (window.innerWidth < "30rem") {
    console.log(document.querySelectorAll(".card-container>*"));
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Menu />
      <MenuBar title="Course Name" description="Course Description" />
      <Container className="card-container">
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
      </Container>
    </div>
  );
}

export default CourseView;
