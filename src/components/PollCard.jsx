import "../styles/text.css";
import "../styles/buttons.css";

import Button from "react-bootstrap/Button";

function PollCard(props) {
  function openPopup(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      console.log("opened", id);
      document.body.style.overflow = "hidden";
      overlay.querySelector(".overlay-bg").style.pointerEvents = "all";
      overlay.querySelector(".overlay-bg").style.opacity = 100;
      overlay.querySelector(".pop-up").style.opacity = 100;
      overlay.style.height = "100vh";
    }
  }

  return (
    <div
      className="card poll-card clickable"
      onClick={() => openPopup(props.title)}
    >
      <p className="card-title poll-card-title">{props.title}</p>
    </div>
  );
}

export default PollCard;
