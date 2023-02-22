import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { IoIosMenu } from "react-icons/io";
import "../styles/texts.css";
import "../styles/menu.css";

function MenuBar(props) {
  return (
    <Container fluid className="menu-bar">
      <Row className="menu-bar-items">
        <Col className="menu-bar-icon">
          <Button variant="transparent">
            <IoIosMenu size="3rem" />
          </Button>
        </Col>
        <Col>Your Courses</Col>
        <Col className="menu-bar-top-right">EN.601.229</Col>
      </Row>
    </Container>
  );
}

export default MenuBar;
