import "../styles/text.css";
import "../styles/buttons.css";

function Card(props) {
  return (
    <div className="card clickable" href="/session" onClick={props.onClick}>
      <div className="card-body">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p className="card-title">{props.title}</p>
          <p className="card-subtitle">{props.instructor}</p>
        </div>
        <p className="card-id">{props.id}</p>
      </div>
    </div>
  );
}

export default Card;
