import Button from "react-bootstrap/Button";

/**
 *
 * @param {{variant: string, label: string, onClick: function}} props
 */
function PrimaryButton(props) {
  return (
    <Button variant={props.variant || "primary"} onClick={props.onClick}>
      {props.label || "Label"}
    </Button>
  );
}

export default PrimaryButton;
