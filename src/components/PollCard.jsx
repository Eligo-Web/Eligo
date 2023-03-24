import "../styles/text.css";
import "../styles/buttons.css";

import { openPopup } from "./Overlay";

/**
 *
 * @param {{title: string}} props
 */
function PollCard(props) {
  if (props.blank) {
    return <div className="card poll-card clickable inactive" />;
  }
  let inactive = "";
  if (props.inactive) {
    inactive = " inactive";
  }
  return (
    <div
      className={"card poll-card clickable" + inactive}
      onClick={() => openPopup(props.title)}
      id={props.title}
    >
      <p className="card-title poll-card-title">{props.title}</p>
    </div>
  );
}

export default PollCard;
