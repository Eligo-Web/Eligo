import PrimaryButton from "../components/Buttons/PrimaryButton";
import Form from "react-bootstrap/Form";

export function Default() {
  return (
    <div className="pop-up-content">
      <Form.Control placeholder="Sample Text" />
      <div className="button-row">
        <PrimaryButton variant="secondary" label="Cancel" />
        <PrimaryButton variant="primary" label="Submit" />
      </div>
    </div>
  );
}

export function JoinOrCreate(props) {
  return;
}

export function Poll(props) {
  return;
}
