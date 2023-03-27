import { Navigate, Route, Routes } from "react-router-dom";
import PageNotFound from "../components/BlankStates";
import InstructorPoll from "../components/InstructorPoll";
import CourseView from "../pages/CourseView";
import Overview from "../pages/Overview";
import Roster from "../pages/Roster";
import SessionView from "../pages/SessionView";
import SignIn from "../pages/SignIn";

function InAppContainer() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/overview" element={<Overview />} />
      <Route path="/session" element={<SessionView />} />
      <Route path="/class" element={<CourseView />} />
      <Route path="/newpoll" element={<InstructorPoll />} />
      <Route path="/roster" element={<Roster />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default InAppContainer;
