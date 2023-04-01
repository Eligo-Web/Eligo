import {
  IconCalculator,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { IoIosArrowBack, IoMdAddCircleOutline } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import * as clicker from "../components/ClickerBase";
import { ClickerContext } from "../containers/InAppContainer";
import { pause } from "../pages/CourseView";
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
  const [showError, setShowError] = useState(false);
  const [base, setBase] = useContext(ClickerContext);
  const [baseButton, setBaseButton] = useState(
    <IconButton
      label="Connect Base"
      icon={<IconCalculator size="1.6em" />}
      variant="outline btn-secondary"
      onClick={async () => {
        closeMenu();
        loadBase();
      }}
    />
  );
  let getLabel = "Join Class";
  if (location.state.permission === "INSTRUCTOR") {
    getLabel = "Create Class";
  }
  if (props.leaveAction) {
    getLabel = "Leave Class";
  }

  useEffect(() => {
    async function hideBaseButton() {
      const devices = await navigator.hid.getDevices();
      if (devices.length || location.state.permission !== "INSTRUCTOR") {
        setBaseButton(null);
      }
    }
    hideBaseButton();
  }, [base]);

  async function loadBase() {
    sessionStorage.setItem("dismissBasePrompt", "false");
    let newBase = await clicker.openDevice();
    if (newBase && !base) {
      setBase(await clicker.initialize(newBase));
    }
  }

  function closeMenu(overlay) {
    const menu = document.getElementById("side-menu");
    menu.querySelector(".overlay-bg").style.pointerEvents = "none";
    menu.querySelector(".overlay-bg").style.opacity = 0;
    menu.querySelector(".menu").style.left = "-18rem";
    document.body.style.overflowY = "overlay";
    if (overlay) openPopup(overlay);
  }

  async function handleSignOut() {
    closeMenu();
    await pause(250);
    sessionStorage.setItem("dismissBasePrompt", "false");
    navigate("/");
  }

  async function updateClickerId() {
    if (clickerId) {
      if (clickerId.length !== 8) {
        setShowError(true);
        return;
      }
      await axios
        .patch(`${server}/student/${location.state.email}/${clickerId}`)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => console.log(err));
    } else {
      await axios
        .delete(`${server}/student/${location.state.email}/clickerId`)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => console.log(err));
    }
    setShowError(false);
  }

  useEffect(() => {
    async function getClickerId() {
      let newClickerId;
      await axios
        .get(`${server}/student/${location.state.email}`)
        .then((res) => {
          newClickerId = res.data.data.clickerId;
        })
        .catch((err) => console.log(err));
      setClickerId(newClickerId || "");
      location.state.clickerId = newClickerId || "";
    }
    if (location.state.permission === "STUDENT" && !location.state.clickerId) {
      getClickerId();
    }
  }, []);

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
          {location.state.permission === "STUDENT" ? (
            <center style={{ padding: "0.5rem 1.5rem" }}>
              <InputField
                class="clicker-id-input"
                label="iClicker Remote ID"
                input="123ABC78"
                default={clickerId}
                maxLength={8}
                onChange={(e) => setClickerId(e.target.value.toUpperCase())}
                onClick={() => updateClickerId()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateClickerId();
                  }
                }}
                style={{ textTransform: "uppercase" }}
                center
                save
              />
              <div
                className="error-banner"
                style={{
                  height: showError ? "fit-content" : 0,
                  fontSize: "0.9rem",
                }}
              >
                Clicker ID must contain 8 digits.
              </div>
            </center>
          ) : null}
        </Container>
        <Container className="d-flex flex-column p-3 gap-2 align-items-center">
          {baseButton}
          {props.hideCreate || props.hideJoin ? null : (
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
