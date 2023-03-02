import Card from "../components/Card";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import Container from "react-bootstrap/Container";
import { JoinClass } from "../components/Popups";
import { IoIosMenu } from "react-icons/io";
import "../styles/overlay.css";
import "../styles/cards.css";

function CourseView(props) {
  function openMenu() {
    document.body.style.overflow = "hidden";
    const menu = document.getElementById("side-menu");
    menu.querySelector(".overlay-bg").style.pointerEvents = "all";
    menu.querySelector(".overlay-bg").style.opacity = 100;
    menu.querySelector(".menu").style.left = 0;
    console.log("opened menu");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Menu />
      <MenuBar
        title="Course Name"
        description="Course Description"
        icon={<IoIosMenu size="3rem" />}
        onClick={openMenu}
      />
      <Overlay title="Join Class" content={JoinClass()} />
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
      </Container>
    </div>
  );
}

export default CourseView;
