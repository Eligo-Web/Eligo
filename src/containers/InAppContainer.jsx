import { Routes, Route, Navigate } from "react-router-dom";
import Overview from "../pages/Overview";
import SessionView from "../pages/SessionView";
import InstructorClassView from "../pages/InstructorClassView";
import SignIn from "../pages/SignIn";

function InAppContainer() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/overview" element={<Overview />} />
      <Route path="/session" element={<SessionView />} />
      <Route path="/class" element={<InstructorClassView />} />
    </Routes>
  );
}

export default InAppContainer;
