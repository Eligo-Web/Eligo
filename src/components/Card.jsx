import "../styles/text.css";
import "../styles/buttons.css";

function Card(props) {
  return (
    <div className="card clickable">
      <div className="card-body">
        <p className="card-title">Computer System Fundamentals</p>
        <p className="card-subtitle">Dave Hovemeyer</p>
        <p className="card-id">EN.601.229</p>
      </div>
    </div>
  );
}

export default Card;
