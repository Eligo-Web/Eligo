import { useNavigate, useLocation } from "react-router-dom";
import { BackButton } from "../components/Buttons";
import Menu from "../components/Menu";
import MenuBar from "../components/MenuBar";

function encodeEmail(str) {
  return str.replace(/[.]/g, "$");
}

function decodeEmail(str) {
  return str.replace(/[$]/g, ".");
}

function populateRoster() {
  const rosterList = [];
}

function RosterItem(props) {
  return (
    <div className="roster-item">
      <div className="card-title">{props.name}</div>
      <div className="card-subtitle">{props.email}</div>
    </div>
  );
}

function Roster() {
  const location = useLocation();
  const navigate = useNavigate();
  const students = location.state.students; // map of encoded student emails to student names

  function populateRoster() {
    const rosterList = [];
    for (let email in students) {
      rosterList.push(
        <RosterItem
          key={email}
          email={decodeEmail(email)}
          name={students[email]}
        />
      );
    }
    return rosterList;
  }

  return (
    <div>
      <BackButton
        label={location.state.courseName}
        onClick={() => navigate("/class", { state: location.state })}
      />
      <div className="roster-header">
        <div>Name</div>
        <div>Email</div>
      </div>
      <div className="roster-wrapper">
        <Menu hideCreate />
        <MenuBar title="Roster" />
        {populateRoster()}
      </div>
    </div>
  );
}

export default Roster;
