import { Button } from "react-bootstrap";

function VoteButton(props) {
  return (
    <Button id={props.label} className="card vote-button">
      {props.label || "?"}
    </Button>
  );
}

export default VoteButton;
