import { Button } from "react-bootstrap";

function VoteButton(props) {
  return (
    <Button
      id={props.label}
      variant="vote"
      className="card"
      onClick={props.onClick}
    >
      {props.label || "?"}
    </Button>
  );
}

export default VoteButton;
