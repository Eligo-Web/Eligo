import { Routes, Route, Navigate } from "react-router-dom";
import Overview from "../pages/Overview";
import SessionView from "../pages/SessionView";
import CourseView from "../pages/CourseView";
import SignIn from "../pages/SignIn";
import InstructorPoll from "../components/InstructorPoll";
import PageNotFound from "../components/PageNotFound";

function InAppContainer() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/overview" element={<Overview />} />
      <Route path="/session" element={<SessionView />} />
      <Route path="/class" element={<CourseView />} />
      <Route path="/newpoll" element={<InstructorPoll />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default InAppContainer;
