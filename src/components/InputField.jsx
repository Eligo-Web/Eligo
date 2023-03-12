import Form from "react-bootstrap/Form";

export default function InputField(props) {
  return (
    <div className={props.section ? "input-field-small" : "input-field"}>
      {props.label || "Title Text"}
      <Form.Control
        className={props.class}
        placeholder={props.input || "Placeholder Text"}
        defaultValue={props.default}
        onChange={props.onChange}
        type={props.type}
      />
    </div>
  );
}

export function SelectField(props) {
  let options = [];
  const today = new Date();

  for (let i = today.getFullYear(); i > 2022; i--) {
    let num = 1;
    const month = today.getMonth();
    if (month > 7 || i != today.getFullYear()) {
      options.push(<option key={`Fall ${i}`}>{`Fall ${i}`}</option>);
    }
    if (month > 5 || i != today.getFullYear()) {
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
        onChange={props.onChange}
      >
        \ {options}
      </Form.Select>
    </div>
  );
}
