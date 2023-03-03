import Card from "../components/Card";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay from "../components/Overlay";
import Container from "react-bootstrap/Container";
import { useLocation } from "react-router-dom";
import { JoinClass } from "../components/Popups";
import "../styles/overlay.css";
import "../styles/cards.css";

function OverView(props) {
  const location = useLocation();
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Menu />
      <MenuBar
        title="Course Name"
        description="Course Description"
        onClick={props.onClick}
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

export default OverView;
