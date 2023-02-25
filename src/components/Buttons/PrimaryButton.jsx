import "../../styles/buttons.css";
import "../../styles/text.css";

import Button from "react-bootstrap/Button";

function PrimaryButton(props) {
  return (
    <Button variant={props.variant || "primary"} onClick={props.onClick}>
      {props.label || "Label"}
    </Button>
  );
}

export default PrimaryButton;
