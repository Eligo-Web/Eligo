import { IconLogout, IconUserCircle } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { IoIosArrowBack, IoMdAddCircleOutline } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/buttons.css";
import "../styles/overlay.css";
import "../styles/text.css";
import { IconButton } from "./Buttons.jsx";
import InputField from "./InputField";
import { openPopup } from "./Overlay";

function Menu(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const server = "http://localhost:3000";
  const [clickerId, setClickerId] = useState(location.state.clickerId || "");
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

  useEffect(() => {
    if (clickerId && clickerId.length === 8) {
      console.log(clickerId);
      axios
        .patch(`${server}/student/${location.state.email}/${clickerId}`)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => console.log(err));
    }
  }, [clickerId]);

  async function leaveClass() {
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
        clickerId: location.state.clickerId,
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
                    clickerId: location.state.clickerId,
                  },
                })
              }
              style={{ cursor: "pointer" }}
            >
              EduPoll
            </div>
          </Container>
          <Container className="d-flex flex-row p-3 gap-3 card-subtitle">
            <IconUserCircle size="1.8em" />
            {location.state.name}
          </Container>
          {location.state.permission === "INSTRUCTOR" ? null : (
            <center style={{ padding: "0.5rem 1.5rem" }}>
              <InputField
                label="iClicker Remote ID"
                input="ex: 123ABC78"
                default={clickerId}
                maxLength={8}
                onChange={(e) => setClickerId(e.target.value.toUpperCase())}
                style={{ textTransform: "uppercase" }}
                center
              />
            </center>
          )}
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
