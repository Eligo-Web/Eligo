import { IconAlertTriangleFilled, IconLock } from "@tabler/icons-react";
import { useEffect } from "react";
import Form from "react-bootstrap/Form";

export default function InputField(props) {
  function renderErrors() {
    const errors = [];
    let key = 0;
    for (let item in props.errors) {
      errors.push(
        <div
          key={key++}
          className={`error-banner ${item}`}
          style={{ fontSize: "1rem", alignSelf: "flex-start", display: "none" }}
        >
          • {props.errors[item]}
        </div>
      );
    }
    return errors;
  }

  return (
    <div className={props.small ? "input-field-small" : "input-field"}>
      <div className="d-flex align-items-center gap-2">
        {props.label || "Title Text"}
        {props.disabled ? <IconLock size="1em" stroke="0.15rem"/> :null}
      </div>
      <Form.Control
        className={props.class}
        placeholder={props.input || "Placeholder Text"}
        defaultValue={props.default}
        onChange={props.onChange}
        onKeyDown={props.onKeyDown}
        value={props.value}
        disabled={props.disabled}
        type={props.type}
        style={props.style}
      />
      {renderErrors()}
    </div>
  );
}

export function SelectField(props) {
  const today = new Date();
  const todayMon = today.getMonth() + 1;
  const todayYr = today.getFullYear();
  let options = [];

  for (let i = today.getFullYear(); i > 2022; i--) {
    if (todayMon > 7 || i != todayYr) {
      options.push(<option key={`Fall ${i}`}>{`Fall ${i}`}</option>);
    }
    if (todayMon > 5 || i != todayYr) {
      options.push(<option key={`Summer ${i}`}>{`Summer ${i}`}</option>);
    }
    options.push(<option key={`Spring ${i}`}>{`Spring ${i}`}</option>);
    options.push(
      <option key={`Intersession ${i}`}>{`Intersession ${i}`}</option>
    );
  }

  return (
    <div className={props.section ? "input-field-small" : "input-field"}>
      {props.label || "Title Text"}
      <Form.Select
        className={props.class}
        placeholder="Select Semester"
        defaultValue={props.default || options[0]}
        onChange={props.onChange}
        onKeyDown={props.onKeyDown}
      >
        \ {options}
      </Form.Select>
    </div>
  );
}
