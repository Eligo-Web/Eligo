import "../../styles/buttons.css";
import "../../styles/texts.css";

import Button from "react-bootstrap/Button";

function PrimaryButton(props) {
  function openPopup() {
    document.querySelector(".overlay-bg").style.pointerEvents = "all";
    document.querySelector(".overlay-bg").style.opacity = 100;
    document.querySelector(".pop-up").style.top = 0;
  }

  return (
    <Button variant="primary" onClick={openPopup}>
      Submit
    </Button>
  );
}

export default PrimaryButton;
