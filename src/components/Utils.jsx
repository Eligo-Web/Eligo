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

import "../styles/overlay.css";

export default function pause(interval = 200) {
  return new Promise((res) => setTimeout(res, interval));
}

export function encodeEmail(str) {
  return str.replace(/[.]/g, "$");
}

export function decodeEmail(str) {
  return str.replace(/[$]/g, ".");
}

export async function displayMessage(msg) {
  msg.style.pointerEvents = "all";
  msg.style.opacity = 1;
  msg.style.width = "30rem";
  await pause(2500);
  msg.style.width = 0;
  await pause(50);
  msg.style.opacity = 0;
  msg.style.pointerEvents = "none";
}

export async function openPopup(id) {
  document.body.style.overflowY = "hidden";
  const overlay = document.getElementById(id + "-popup");
  if (overlay) {
    overlay.style.display = "flex";
    await pause(50);
    if (id === "Create Session") {
      const nameField = overlay.querySelector(".session-name-input");
      nameField.value = new Date().toDateString();
    }
    const overlayBG = overlay.querySelector(".overlay-bg");
    const overlayBody = overlay.querySelector(".pop-up");
    const form = overlay.querySelector(".form-control");
    overlay.style.maxHeight = "100vh";
    overlay.style.overflow = "visible";
    overlayBody.style.opacity = 1;
    overlayBody.style.transform = "scale(1)";
    overlayBody.isOpen = true;
    overlayBG.style.opacity = 1;
    await pause(100);
    overlayBG.style.pointerEvents = "all";
    await pause();
    if (form) form.focus();
  }
}

export async function closePopup(id, setPopup) {
  const overlay = document.getElementById(id + "-popup");
  if (overlay) {
    const overlayBody = overlay.querySelector(".pop-up");
    const overlayBG = overlay.querySelector(".overlay-bg");
    overlayBG.style.pointerEvents = "none";
    overlay.style.maxHeight = "60vh";
    overlay.style.overflow = "hidden";
    overlayBG.style.opacity = 0;
    overlayBody.style.opacity = 0;
    overlayBody.style.transform = "scale(0.9)";
    overlayBody.isOpen = false;
    document.body.style.overflowY = "overlay";
    await pause();
    overlay.style.display = "none";
  }
  if (setPopup) setPopup(null);
}
