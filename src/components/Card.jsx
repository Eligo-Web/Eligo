import "../styles/texts.css";

function Card(props) {
  return (
    <div className="card" style={styles.card}>
      <div className="card-body">
        <p className="card-title">Computer System Fundamentals</p>
        <p className="card-text">EN.601.229</p>
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: "18rem",
    height: "7rem",
    padding: "1rem",
    backgroundColor: "#B2C6ED",
    borderRadius: "0.25rem",
  },
};

export default Card;
