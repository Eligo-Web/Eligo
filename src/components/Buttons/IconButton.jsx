import "../../styles/buttons.css";
import "../../styles/text.css";

import Button from "react-bootstrap/Button";

function IconButton(props) {
  return (
    <Button variant={props.variant || "icon"} onClick={props.onClick}>
      {props.icon}
      {props.label || "Label"}
    </Button>
  );
}

export default IconButton;
