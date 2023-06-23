// Eligo is a web application primarily used for in-class polls.
// Copyright (C) 2023  Eligo-Web <smodare1@jhu.edu> <ffernan9@jhu.edu>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
import {
  ClickerContext,
  GlobalPopupContext,
} from "../containers/InAppContainer";
import "../styles/buttons.css";
import "../styles/overlay.css";
import "../styles/text.css";
import { IconButton, PrimaryButton } from "./Buttons.jsx";
import InputField from "./InputField";
import pause, { sessionValid } from "./Utils";

function Menu(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [clickerId, setClickerId] = useState(location.state.clickerId || "");
  const [showError, setShowError] = useState(false);
  const [base, setBase] = useContext(ClickerContext);
  const [popup, setPopup] = useContext(GlobalPopupContext);
  const [baseButton, setBaseButton] = useState(null);
  let getLabel = "Join Class";
  if (location.state.permission === "INSTRUCTOR") {
    getLabel = "Create Class";
  } else if (props.leaveAction) {
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
              await pause(150);
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

  async function closeMenu() {
    const menuContainer = document.getElementById("side-menu");
    const menuBG = menuContainer.querySelector(".overlay-bg");
    const menu = menuContainer.querySelector(".menu");
    menuBG.style.pointerEvents = "none";
    menuBG.style.opacity = 0;
    menuBG.style.transition = "var(--close-bezier)";
    menu.style.transition = "var(--close-bezier)";
    menu.style.transform = "translateX(0px)";
    menu.style.boxShadow = "none";
    await pause(10);
    document.body.style.overflowY = "overlay";
  }

  async function handleSignOut() {
    closeMenu();
    await pause(250);
    if (navigator.hid) {
      sessionStorage.setItem("dismissBasePrompt", "false");
    }
    await axios
      .delete(`${server}/${location.state.permission.toLowerCase()}/signout`)
      .then(() => {
        navigate("/");
      })
      .catch();
  }

  async function updateClickerId() {
    if (clickerId) {
      if (clickerId.length !== 8) {
        setShowError(true);
        return;
      }
      await axios
        .patch(`${server}/student/${location.state.email}/${clickerId}`)
        .catch((err) => {
          if (!sessionValid(err.response, setPopup)) return;
        });
    } else {
      await axios
        .delete(`${server}/student/${location.state.email}/clickerId`)
        .catch((err) => {
          if (!sessionValid(err.response, setPopup)) return;
        });
      location.state.clickerId = "";
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
        .catch((err) => {
          if (!sessionValid(err.response, setPopup)) return;
        });
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
      .catch((err) => {
        if (!sessionValid(err.response, setPopup)) return;
      });
    await axios
      .delete(
        `${server}/course/${location.state.sectionId}/${location.state.email}`
      )
      .catch((err) => {
        if (!sessionValid(err.response, setPopup)) return;
      });
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
          {location.state.permission === "STUDENT" && (
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
          )}
          {!base && baseButton}
          {props.hideCreate || props.hideJoin || props.leaveAction ? null : (
            <IconButton
              title={getLabel}
              label={getLabel}
              icon={<IoMdAddCircleOutline size="1.7em" />}
              onClick={() => {
                closeMenu();
                pause(200).then(() => {
                  if (props.popup) setPopup(props.popup);
                });
              }}
            />
          )}
          {props.leaveAction && (
            <PrimaryButton
              label="Leave Class"
              variant="outline justify-content-center"
              onClick={() => {
                closeMenu();
                leaveClass();
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
