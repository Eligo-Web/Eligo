import { IconCalculator, IconChevronLeft, IconX } from "@tabler/icons-react";
import { useEffect } from "react";
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
  useEffect(() => {
    load();
    async function load() {
      const devices = await navigator.hid.getDevices();
      if (props.base || devices.length) {
        await dismiss();
        return;
      }
      await pause(1000);
      const btn = document.querySelector(".reconnect-base-btn");
      if (btn && !props.base) {
        const label = btn.querySelector(".reconnect-btn-label");
        btn.style.opacity = 0.5;
        await pause(50);
        if (label) label.style.width = "20rem";
        btn.style.opacity = 1;
      }
    }
  }, [props.base]);

  async function dismiss(event) {
    console.log("dismissed");
    if (event) event.stopPropagation();
    const btn = document.querySelector(".reconnect-base-btn");
    if (btn) {
      const label = btn.querySelector(".reconnect-btn-label");
      if (label) label.style.width = 0;
      await pause();
      btn.style.opacity = 0;
      btn.style.pointerEvents = "none";
    }
  }

  return (
    <div className="reconnect-base-btn" onClick={props.onClick}>
      <div className="d-flex gap-3 align-items-center">
        <IconCalculator size="1.5em" />
        <div className="reconnect-btn-label">Connect iClicker Base</div>
        <IconX
          style={{ marginLeft: "0.5rem" }}
          onClick={(event) => dismiss(event)}
        />
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
      icon={<IconChevronLeft size="1.5em" />}
      label={props.label}
      variant="transparent"
      onClick={props.onClick}
    />
  );
}
