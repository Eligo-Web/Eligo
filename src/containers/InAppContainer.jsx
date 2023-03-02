import { Routes, Route, Navigate } from "react-router-dom";

import Overview from "../pages/Overview";
import SessionView from "../pages/SessionView";
import InstructorClassView from "../pages/InstructorClassView";

function InAppContainer() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/overview" />} />
      <Route path="/overview" element={<Overview />} />
      <Route path="/session" element={<SessionView />} />
      <Route path="/instructor" element={<InstructorClassView />} />
    </Routes>
  );
}

export default InAppContainer;
