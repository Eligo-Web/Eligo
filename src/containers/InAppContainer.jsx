import { Routes, Route } from "react-router-dom";

import CourseView from "../pages/CourseView";
import SessionView from "../pages/SessionView";

function InAppContainer() {
  return (
    <Routes>
      <Route path="/" element={<CourseView />} />
      <Route path="/session" element={<SessionView />} />
    </Routes>
  );
}

export default InAppContainer;
