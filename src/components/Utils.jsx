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
