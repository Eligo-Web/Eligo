import '../styles/texts.css';

function Card(props) {
    return (
        <div className="card" style={styles.card}>
            <div className="card-body">
                <p className="card-title">Computer System Fundamentals</p>
                <p className="card-text">{props.text}</p>
            </div>
        </div>
    );
}

const styles = {
    card: {
        width: "18rem",
        height: "7rem",
        margin: "1rem",
        padding: "1rem",
        backgroundColor: "#B2C6ED",
        borderRadius: "0.25rem",
        boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
    },
};

export default Card;