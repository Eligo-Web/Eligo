import { useNavigate, useLocation } from "react-router-dom";

export function encodeEmail(str) {
  return str.replace(/[.]/g, "$");
}

export function decodeEmail(str) {
  return str.replace(/[$]/g, ".");
}

function Roster() {
  const location = useLocation();
  const navigate = useNavigate();
  const students = location.state.students; // map of encoded student emails to student names
  console.log(students);
  return (
    <div className="container">
      {Object.keys(students).map((email) => {
        return (
          <div className="card" key={email}>
            <h3>{students[email]}</h3>
            <p>{decodeEmail(email)}</p>
          </div>
        );
      })}
    </div>
  );
}

export default Roster;
