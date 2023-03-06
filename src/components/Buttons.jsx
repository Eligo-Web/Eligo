import Button from "react-bootstrap/Button";

/**
 * @param {{variant: string, label: string, onClick: function}} props
 */
export function PrimaryButton(props) {
  return (
    <Button variant={props.variant || "primary"} onClick={props.onClick}>
      {props.label || "Label"}
    </Button>
  );
}

/**
 * @param {{variant: string, onClick: function, style: object, icon: object, label: string}} props
 */
export function IconButton(props) {
  return (
    <Button
      id={props.label + " button"}
      variant={props.variant || "icon"}
      onClick={props.onClick}
      style={props.style}
    >
      {props.icon}
      {props.label}
    </Button>
  );
}

export function VoteButton(props) {
  return (
    <Button
      id={props.label + " button"}
      variant="vote"
      className="card"
      onClick={props.onClick}
    >
      {props.label || "?"}
    </Button>
  );
}
