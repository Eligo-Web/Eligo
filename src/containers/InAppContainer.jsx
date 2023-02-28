import Card from "../components/Card";
import PollCard from "../components/PollCard";
import MenuBar from "../components/MenuBar";
import SessionCard from "../components/SessionCard";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import "../styles/overlay.css";
import { Container } from "react-bootstrap";
import { JoinOrCreate, Poll } from "../components/Popups";
import "../styles/containers.css";

function InAppContainer() {
  console.log(window.innerWidth);
  if (window.innerWidth < "30rem") {
    console.log(document.querySelectorAll(".card-container>*"));
  }

  function openPopup(id) {
    console.log("opened", id);
    document.body.style.overflow = "hidden";
    const overlay1 = document.getElementById(id);
    overlay1.querySelector(".overlay-bg").style.pointerEvents = "all";
    overlay1.querySelector(".overlay-bg").style.opacity = 100;
    overlay1.querySelector(".pop-up").style.opacity = 100;
    overlay1.style.height = "100vh";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Menu />
      <MenuBar />
      <Overlay id="popup1" title="Test Title" />
      <Overlay id="popup2" contents={Poll} />
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
        <PollCard title="popup1" />
        <PollCard title="popup2" />
      </Container>
    </div>
  );
}

export default InAppContainer;
