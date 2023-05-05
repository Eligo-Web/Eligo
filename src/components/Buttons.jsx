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
  IconChevronLeft,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import "../styles/animations.css";
import pause, { displayMessage } from "./Utils";

/**
 * @param {{variant: string, label: string, onClick: function}} props
 */
export function PrimaryButton(props) {
  return (
    <Button
      variant={props.variant || "primary"}
      onClick={props.onClick}
      id={props.id + "-button"}
      disabled={props.disabled || props.loading}
      style={props.style}
    >
      {props.loading ? (
        <div className="loading-ellipse" />
      ) : (
        props.label || "Label"
      )}
    </Button>
  );
}

/**
 * @param {{variant: string, onClick: function, style: object, icon: object, label: string}} props
 */
export function IconButton(props) {
  return (
    <Button
      id={props.label ? `${props.label}-icon-button` : "No Label"}
      aria-label={props.ariaLabel || props.label || "Not provided"}
      variant={props.variant || "icon"}
      className={props.className}
      onClick={props.onClick}
      style={props.style}
      disabled={props.disabled}
    >
      {props.icon && <div className="button-icon">{props.icon}</div>}
      {props.hideLabel ? null : props.label || "No Label"}
    </Button>
  );
}

export function Tooltip(props) {
  return (
    <div
      className={`tooltip ${props.className}`}
      style={{ transform: `translate(${props.X},${props.Y})` }}
    >
      {props.txt}
    </div>
  );
}

export function FloatingButton(props) {
  const [label, setLabel] = useState("Connect iClicker Base");

  useEffect(() => {
    if (!navigator.hid) return;
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
        const label = btn.querySelector(".connect-btn-label");
        btn.style.opacity = 0.5;
        if (label) label.style.width = "20rem";
        await pause(50);
        btn.style.opacity = 1;
        await pause(100);
        btn.style.pointerEvents = "all";
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
      btn.style.pointerEvents = "none";
      const label = btn.querySelector(".connect-btn-label");
      if (label) label.style.width = 0;
      await pause();
      btn.style.opacity = 0;
    }
    if (saveState) {
      sessionStorage.setItem("dismissBasePrompt", "true");
      await pause();
      await showTooltip();
    }
  }

  async function showTooltip() {
    const numTimes = localStorage.getItem("hideTooltip") || 0;
    if (parseInt(numTimes) > 1) return;
    localStorage.setItem("hideTooltip", parseInt(numTimes) + 1);
    const msg = document.querySelector(".connect-base-tooltip");
    if (msg) await displayMessage(msg);
  }

  async function handleClick() {
    setLabel("Connecting...");
    await props.onClick();
    const devices = await navigator.hid.getDevices();
    if (devices.length) await pause(1000);
    setLabel("Connect iClicker Base");
  }

  return (
    <div>
      <div className="connect-base-tooltip">
        <IconInfoCircle size="2.5em" stroke="0.1rem" />
        <div style={{ minWidth: "19rem", maxWidth: "19rem" }}>
          You can always connect your iClicker base station from the menu.
        </div>
      </div>
      <div className="disconnected-tooltip">
        <IconInfoCircle size="2em" stroke="0.1rem" />
        <div style={{ minWidth: "10rem", maxWidth: "10rem" }}>
          Base Disconnected
        </div>
      </div>
      <div className="connect-base-btn" onClick={() => handleClick()}>
        <div className="d-flex gap-3 align-items-center">
          <IconCalculator size="1.4em" />
          <div className="connect-btn-label">{label}</div>
          <IconX
            size="2.2em"
            stroke="0.14rem"
            className="absolute-hint position-relative"
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
      className="back-navigate"
      icon={<IconChevronLeft size="1.5em" />}
      label={props.label}
      variant="transparent"
      onClick={props.onClick}
    />
  );
}
