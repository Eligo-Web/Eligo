import Card from "../components/Card";
import PollCard from "../components/PollCard";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import MenuBar from "../components/MenuBar";
import SessionCard from "../components/SessionCard";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import Form from "react-bootstrap/Form";
import "../styles/overlay.css";
import { Container } from "react-bootstrap";

function InAppContainer() {
  function openPopup() {
    document.querySelector(".overlay-bg").style.pointerEvents = "all";
    document.querySelector(".overlay-bg").style.opacity = 100;
    document.querySelector(".pop-up").style.opacity = 100;
    document.querySelector(".overlay-wrapper").style.height = "100%";
  }

  return (
    <div style={{ overflow: "hidden" }}>
      <Menu />
      <MenuBar />
      <Overlay
        contents={
          <div className="pop-up-content">
            <Form.Control className="input-field" placeholder="Field" />
            <div className="button-row">
              <PrimaryButton variant="secondary" label="Cancel" />
              <PrimaryButton variant="primary" label="Submit" />
            </div>
          </div>
        }
      />
      <Container
        style={{
          display: "grid",
          gap: "1rem",
          padding: "1rem 0",
          justifyContent: "center",
          justifyItems: "center",
          overflow: "clip",
        }}
      >
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <PollCard onClick={openPopup} />
        <SessionCard />
      </Container>
    </div>
  );
}

export default InAppContainer;
