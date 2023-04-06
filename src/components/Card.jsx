import { IconPencil } from "@tabler/icons-react";
import "../styles/buttons.css";
import "../styles/text.css";

function Card(props) {
  const handleEdit = (event) => {
    event.stopPropagation();
    props.onEdit();
  };

  return (
    <div className="card clickable" href="/session" onClick={props.onClick}>
      <div className="card-body" id={props.id}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p className="card-title">{props.title}</p>
          <p className="card-subtitle">{props.instructor}</p>
        </div>
        <p className="card-id">{props.sisId}</p>
        {props.editable ? (
          <IconPencil
            id="edit-button"
            className="edit-button"
            size={"2.7em"}
            onClick={handleEdit}
          />
        ) : null}
      </div>
    </div>
  );
}

export default Card;
