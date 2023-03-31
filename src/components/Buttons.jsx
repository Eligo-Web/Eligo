import * as Tabler from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { pause } from "../pages/CourseView";

/**
 * @param {{variant: string, label: string, onClick: function}} props
 */
export function PrimaryButton(props) {
  return (
    <Button
      variant={props.variant || "primary"}
      onClick={props.onClick}
      id={props.id ? props.id + "-save-button" : null}
    >
      {props.label || "Label"}
    </Button>
  );
}

/**
 * @param {{variant: string, onClick: function, style: object, icon: object, label: string}} props
 */
export function IconButton(props) {
  return (
    <Button
      id={props.label + " button"}
      variant={props.variant || "icon"}
      onClick={props.onClick}
      style={props.style}
    >
      {props.icon}
      {props.label}
    </Button>
  );
}

export function FloatingButton(props) {
  const [label, setLabel] = useState("Connect iClicker Base");

  useEffect(() => {
    load();
    async function load() {
      const prompt = sessionStorage.getItem("dismissBasePrompt");
      if (prompt === "true") {
        return;
      }
      const devices = await navigator.hid.getDevices();
      if (props.base || devices.length) {
        await dismiss();
        return;
      }
      await pause(1000);
      const btn = document.querySelector(".connect-base-btn");
      if (btn && !props.base) {
        btn.style.pointerEvents = "all";
        const label = btn.querySelector(".connect-btn-label");
        btn.style.opacity = 0.5;
        if (label) label.style.width = "20rem";
        await pause(50)
        btn.style.opacity = 1;
      }
    }
  }, [props.base]);

  useEffect(() => {
    if (props.bottom) {
      document.querySelector(".connect-base-btn").style.bottom = "2rem";
    }
  }, []);

  async function dismiss(event, saveState = false) {
    if (event) event.stopPropagation();
    const btn = document.querySelector(".connect-base-btn");
    if (btn) {
      const label = btn.querySelector(".connect-btn-label");
      if (label) label.style.width = 0;
      await pause();
      btn.style.opacity = 0;
      btn.style.pointerEvents = "none";
    }
    if (saveState) {
      sessionStorage.setItem("dismissBasePrompt", "true");
      await pause();
      await showTooltip();
    }
  }

  async function showTooltip() {
    const msg = document.querySelector(".connect-base-tooltip");
    if (msg) {
      msg.style.pointerEvents = "all";
      msg.style.opacity = 1;
      msg.style.width = "30rem";
      await pause(2500);
      msg.style.width = 0;
      await pause(50);
      msg.style.opacity = 0;
      msg.style.pointerEvents = "none";
    }
  }

  async function handleClick() {
    setLabel("Connecting...");
    await props.onClick();
    await navigator.hid.getDevices();
    await pause(1000);
    setLabel("Connect iClicker Base");
  }

  return (
    <div>
      <div className="connect-base-tooltip">
        <Tabler.IconInfoCircle className="tooltip-icon" stroke="0.1rem" />
        <div style={{ minWidth: "19rem", maxWidth: "19rem" }}>
          You can always connect your iClicker base station from the menu.
        </div>
      </div>
      <div className="connect-base-btn" onClick={() => handleClick()}>
        <div className="d-flex gap-3 align-items-center">
          <Tabler.IconCalculator size="1.4em" />
          <div className="connect-btn-label">{label}</div>
          <Tabler.IconX
            size="1.5em"
            stroke="0.14rem"
            style={{ marginLeft: "0.7rem" }}
            onClick={(event) => dismiss(event, true)}
          />
        </div>
      </div>
    </div>
  );
}

export function VoteButton(props) {
  return (
    <Button
      id={props.label + "-button"}
      variant="vote"
      className="card"
      onClick={props.onClick}
    >
      {props.label || "?"}
    </Button>
  );
}

export function BackButton(props) {
  return (
    <IconButton
      style={{
        padding: "1rem",
        paddingLeft: "1.5rem",
        color: "#000d1db3",
        fontWeight: "500",
        position: "absolute",
        top: "5rem",
        zIndex: 1,
      }}
      icon={<Tabler.IconChevronLeft size="1.5em" />}
      label={props.label}
      variant="transparent"
      onClick={props.onClick}
    />
  );
}
