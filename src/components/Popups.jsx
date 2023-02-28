import PrimaryButton from "../components/Buttons/PrimaryButton";
import Form from "react-bootstrap/Form";
import InputField from "./InputField";

export function Default() {
  return (
    <div className="pop-up-content">
      <InputField/>
      <div className="button-row">
        <PrimaryButton variant="secondary" label="Cancel" />
        <PrimaryButton variant="primary" label="Submit" />
      </div>
    </div>
  );
}

export function JoinOrCreate(props) {
  return (
    <div className="pop-up-content">
      <Form.Control placeholder="Sample Text" />
      <Form.Control placeholder="Sample Text" />
      <div className="button-row">
        <PrimaryButton variant="secondary" label="Cancel" />
        <PrimaryButton variant="primary" label="Submit" />
      </div>
    </div>
  );
}

export function Poll(props) {
  return;
}
