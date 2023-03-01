import "../styles/text.css";
import "../styles/buttons.css";

import { openPopup } from "./Overlay";

/**
 *
 * @param {{title: string}} props
 */
function PollCard(props) {
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
