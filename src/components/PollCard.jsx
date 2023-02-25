import "../styles/text.css";
import "../styles/buttons.css";

import Button from "react-bootstrap/Button";

function PollCard(props) {
  return (
    <div className="card poll-card clickable" onClick={props.onClick}>
      <p className="card-title poll-card-title">Poll 1</p>
    </div>
  );
}

export default PollCard;
