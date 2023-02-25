import "../../styles/buttons.css";
import "../../styles/texts.css";

import Button from "react-bootstrap/Button";

function PrimaryButton(props) {
  return (
    <Button variant="primary" onClick={props.onClick}>
      Submit
    </Button>
  );
}

export default PrimaryButton;
