import Button from "react-bootstrap/Button";

function IconButton(props) {
  return (
    <Button
      variant={props.variant || "icon"}
      onClick={props.onClick}
      style={props.style}
    >
      {props.icon}
      {props.label || "Label"}
    </Button>
  );
}

export default IconButton;
