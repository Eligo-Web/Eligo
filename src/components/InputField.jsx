import Form from "react-bootstrap/Form";

export default function InputField(props) {
  return (
    <div className={props.class || "input-field"}>
      {props.label || "Title Text"}
      <Form.Control
        placeholder={props.input || "Placeholder Text"}
        defaultValue={props.value}
      />
    </div>
  );
}
