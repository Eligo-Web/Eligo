import "../styles/text.css";
import "../styles/buttons.css";

import Button from "react-bootstrap/Button";

function PollCard(props) {
  function openPopup(id) {
    console.log("opened", id);
    document.body.style.overflow = "hidden";
    const overlay1 = document.getElementById(id);
    overlay1.querySelector(".overlay-bg").style.pointerEvents = "all";
    overlay1.querySelector(".overlay-bg").style.opacity = 100;
    overlay1.querySelector(".pop-up").style.opacity = 100;
    overlay1.style.height = "100vh";
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
