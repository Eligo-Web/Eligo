import "../styles/text.css";
import "../styles/buttons.css";
import "../styles/overlay.css";
import { openPopup } from "./Overlay";
import { IconButton } from "./Buttons.jsx";
import { Button, Container } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { IconLogout, IconUserCircle } from "@tabler/icons-react";
import { IoIosArrowBack, IoMdAddCircleOutline } from "react-icons/io";
import axios from "axios";

function Menu(props) {
  const location = useLocation();
  const navigate = useNavigate();
  let getLabel = "Join Class";
  if (location.state.permission === "INSTRUCTOR") {
    getLabel = "Create Class";
  }
  if (props.leaveAction) {
    getLabel = "Leave Class";
  }

  function closeMenu(overlay) {
    const menu = document.getElementById("side-menu");
    menu.querySelector(".overlay-bg").style.pointerEvents = "none";
    menu.querySelector(".overlay-bg").style.opacity = 0;
    menu.querySelector(".menu").style.left = "-18rem";
    document.body.style.overflow = "overlay";
    console.log("closed menu");
    openPopup(overlay);
  }

  function handleSignOut() {
    closeMenu();
    navigate("/");
  }

  async function leaveClass() {
    const server = "http://localhost:3000";
    await axios
      .delete(
        `${server}/student/${location.state.email}/${location.state.semester}/${location.state.sectionId}`
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
    await axios
      .delete(
        `${server}/course/${location.state.sectionId}/${location.state.email}`
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
    navigate("/overview", {
      state: {
        name: location.state.name,
        permission: location.state.permission,
        email: location.state.email,
      },
    });
  }

  return (
    <div id="side-menu">
      <div className="overlay menu">
        <Container className="p-0">
          <Container className="menu-overlay-header">
            <Button variant="transparent" className="menu-overlay-back">
              <IoIosArrowBack size="1.8em" onClick={closeMenu} />
            </Button>
            <div
              className="menu-overlay-title"
              onClick={() =>
                navigate("/overview", {
                  state: {
                    name: location.state.name,
                    permission: location.state.permission,
                    email: location.state.email,
                  },
                })
              }
              style={{ cursor: "pointer" }}
            >
              Eligo
            </div>
          </Container>
          <Container className="d-flex flex-row p-3 gap-3 card-subtitle">
            <IconUserCircle size="1.8em" />
            {location.state.name}
          </Container>
        </Container>
        <Container className="d-flex flex-column p-3 gap-2 align-items-center">
          {props.hideCreate ? null : (
            <IconButton
              label={getLabel}
              variant={props.leaveAction ? "delete" : ""}
              icon={
                props.leaveAction ? null : <IoMdAddCircleOutline size="1.7em" />
              }
              onClick={() => {
                closeMenu(getLabel);
                if (props.leaveAction) {
                  leaveClass();
                }
              }}
            />
          )}
          <IconButton
            label="Sign Out"
            variant="sign-out"
            icon={<IconLogout size="1.65em" />}
            onClick={handleSignOut}
          />
        </Container>
      </div>
      <div className="overlay-bg" onClick={closeMenu} />
    </div>
  );
}

export default Menu;
