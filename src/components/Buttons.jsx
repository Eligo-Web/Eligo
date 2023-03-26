import { IconArrowLeft, IconChevronLeft } from "@tabler/icons-react";
import Button from "react-bootstrap/Button";

/**
 * @param {{variant: string, label: string, onClick: function}} props
 */
export function PrimaryButton(props) {
  return (
    <Button
      variant={props.variant || "primary"}
      onClick={props.onClick}
      id={props.id ? props.id + "-save-button" : null}
    >
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
      id={props.label + "-button"}
      variant="vote"
      className="card"
      onClick={props.onClick}
    >
      {props.label || "?"}
    </Button>
  );
}

export function BackButton(props) {
  return (
    <IconButton
      style={{
        padding: "1rem",
        paddingLeft: "1.5rem",
        color: "#000d1db3",
        fontWeight: "500",
        position: "absolute",
        top: "5rem",
        zIndex: 1,
      }}
      icon={<IconChevronLeft size="1.5em" />}
      label={props.label}
      variant="transparent"
      onClick={props.onClick}
    />
  );
}
