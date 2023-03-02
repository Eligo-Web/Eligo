import "../styles/text.css";
import "../styles/buttons.css";

function Card(props) {
  return (
    <div className="card clickable" href="/session">
      <div className="card-body">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p className="card-title">Computer System Fundamentals</p>
          <p className="card-subtitle">Dave Hovemeyer</p>
        </div>
        <p className="card-id">EN.601.229</p>
      </div>
    </div>
  );
}

export default Card;
