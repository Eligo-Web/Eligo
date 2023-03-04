import Button from "react-bootstrap/Button";

function IconButton(props) {
  return (
    <Button
      variant={props.variant || "icon"}
      onClick={props.onClick}
      style={props.style}
    >
      {props.icon}
      {props.label}
    </Button>
  );
}

export default IconButton;
