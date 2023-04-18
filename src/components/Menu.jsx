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
import { server } from "../ServerUrl";
import logo from "../assets/eligo-logo.svg";
import * as clicker from "../components/ClickerBase";
import { ClickerContext } from "../containers/InAppContainer";
import { pause } from "../pages/CourseView";
import "../styles/buttons.css";
import "../styles/overlay.css";
import "../styles/text.css";
import { IconButton, PrimaryButton } from "./Buttons.jsx";
import InputField from "./InputField";
import { openPopup } from "./Overlay";

function Menu(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [clickerId, setClickerId] = useState(location.state.clickerId || "");
  const [showError, setShowError] = useState(false);
  const [base, setBase] = useContext(ClickerContext);
  const [baseButton, setBaseButton] = useState(null);
  let getLabel = "Join Class";
  if (location.state.permission === "INSTRUCTOR") {
    getLabel = "Create Class";
  }
  if (props.leaveAction) {
    getLabel = "Leave Class";
  }

  useEffect(() => {
    if (!navigator.hid) return;
    async function showBaseButton() {
      const devices = await navigator.hid.getDevices();
      if (devices.length || location.state.permission === "INSTRUCTOR") {
        setBaseButton(
          <IconButton
            label="Connect Base"
            icon={<IconCalculator size="1.6em" />}
            variant="outline btn-secondary"
            onClick={async () => {
              closeMenu();
              await pause(100);
              loadBase();
            }}
          />
        );
      }
    }
    showBaseButton();
  }, [base]);

  async function loadBase() {
    if (!navigator.hid) return;
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
    menu.querySelector(".menu").style.transform = "translate(-18rem,0)";
    document.body.style.overflowY = "overlay";
    if (overlay) openPopup(overlay);
  }

  async function handleSignOut() {
    closeMenu();
    await pause(250);
    if (navigator.hid) {
      sessionStorage.setItem("dismissBasePrompt", "false");
    }
    navigate("/signin");
  }

  async function updateClickerId() {
    if (clickerId) {
      if (clickerId.length !== 8) {
        setShowError(true);
        return;
      }
      await axios.patch(
        `${server}/student/${location.state.email}/${clickerId}`
      );
    } else {
      await axios.delete(`${server}/student/${location.state.email}/clickerId`);
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
        });
      setClickerId(newClickerId || "");
      location.state.clickerId = newClickerId || "";
    }
    if (location.state.permission === "STUDENT" && !location.state.clickerId) {
      getClickerId();
    }
  }, []);

  async function leaveClass() {
    await axios.delete(
      `${server}/student/${location.state.email}/${location.state.semester}/${location.state.sectionId}`
    );
    await axios.delete(
      `${server}/course/${location.state.sectionId}/${location.state.email}`
    );
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
            <Button
              variant="transparent"
              className="menu-overlay-back"
              aria-label="Close Menu"
            >
              <IoIosArrowBack size="1.8em" onClick={closeMenu} />
            </Button>
            <div
              id="Eligo"
              className="menu-overlay-title"
              onClick={async () => {
                closeMenu();
                await pause(300);
                navigate("/overview", {
                  state: {
                    name: location.state.name,
                    permission: location.state.permission,
                    email: location.state.email,
                    clickerId: location.state.clickerId,
                  },
                });
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="eligo-logo d-flex">
                <img src={logo} alt="Eligo Logo" width="100%" height="100%" />
              </div>
              ligo
            </div>
          </Container>
          <Container className="d-flex flex-row p-3 gap-3 card-subtitle">
            <IconUserCircle size="1.8em" />
            {location.state.name}
          </Container>
        </Container>
        <Container className="d-flex flex-column p-3 gap-2 align-items-center">
          {location.state.permission === "STUDENT" ? (
            <center style={{ padding: "1rem 0" }}>
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
                  display: showError ? "flex" : "none",
                  fontSize: "0.9rem",
                }}
              >
                Clicker ID must contain 8 digits.
              </div>
            </center>
          ) : null}
          {baseButton}
          {props.hideCreate || props.hideJoin || props.leaveAction ? null : (
            <IconButton
              label={getLabel}
              icon={<IoMdAddCircleOutline size="1.7em" />}
              onClick={() => closeMenu(getLabel)}
            />
          )}
          {props.leaveAction ? (
            <PrimaryButton
              label="Leave Class"
              variant="outline justify-content-center"
              onClick={() => {
                closeMenu(getLabel);
                leaveClass();
              }}
            />
          ) : null}
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
