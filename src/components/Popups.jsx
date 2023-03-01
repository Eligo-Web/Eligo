import PrimaryButton from "../components/Buttons/PrimaryButton";
import VoteButton from "./Buttons/VoteButton";
import InputField from "./InputField";
import { closePopup } from "./Overlay";

export function Default() {
  return (
    <div className="pop-up-content">
      <InputField />
      <div className="button-row">
        <PrimaryButton variant="secondary" label="Cancel" />
        <PrimaryButton variant="primary" label="Submit" />
      </div>
    </div>
  );
}

function JoinOrCreate(props) {
  return (
    <div className="pop-up-content">
      <InputField label={props.inputLabel} input={props.placeholder} />
      <div className="button-row">
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => closePopup(props.id)}
        />
        <PrimaryButton
          variant="primary"
          label={props.primary}
          onClick={() => {
            /**TODO */
          }}
        />
      </div>
    </div>
  );
}

export function JoinClass() {
  return (
    <JoinOrCreate
      id="Join Class"
      primary="Join"
      inputLabel="Course Code"
      placeholder="ex: A1B2C3"
    />
  );
}

export function JoinSession(props) {
  return (
    <JoinOrCreate
      id="Join Session"
      primary="Join"
      inputLabel="Password"
      placeholder="Ex: •••••••"
    />
  );
}

export function CreateClass() {
  return (
    <div className="pop-up-content">
      <div className="input-group">
        <InputField label="Class Name" input="ex: Intermediate Programming" />
        <InputField class="section-input" label="Section" input="#" />
      </div>
      <div className="button-row">
        <PrimaryButton
          variant="secondary"
          label="Cancel"
          onClick={() => closePopup("Create Class")}
        />
        <PrimaryButton variant="primary" label="Create" />
      </div>
    </div>
  );
}

export function createSession() {
  return (
    <JoinOrCreate
      id="Create Session"
      primary="Create"
      inputLabel="Session Name"
      placeholder="ex: March 14 11AM class"
    />
  );
}

export function Poll(props) {
  return (
    <div className="vote-btn-container">
      <VoteButton label="A" />
      <VoteButton label="B" />
      <VoteButton label="C" />
      <VoteButton label="D" />
      <VoteButton label="E" />
    </div>
  );
}
