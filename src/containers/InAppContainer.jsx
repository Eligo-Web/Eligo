import { createContext, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PageNotFound } from "../components/BlankStates";
import InstructorPoll from "../components/InstructorPoll";
import CourseView from "../pages/CourseView";
import Overview from "../pages/Overview";
import Roster from "../pages/Roster";
import SessionView from "../pages/SessionView";
import SignIn from "../pages/SignIn";

export const ClickerContext = createContext(null);
export const EditPopupContext = createContext(null);
export const NewPollContext = createContext(null);

function InAppContainer() {
  const [base, setBase] = useState(null);
  const [editPopup, setEditPopup] = useState(null);
  const [pollWinInfo, setPollWinInfo] = useState(null);

  return (
    <ClickerContext.Provider value={[base, setBase]}>
      <EditPopupContext.Provider value={[editPopup, setEditPopup]}>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/class" element={<CourseView />} />
          <Route
            path="/session"
            element={
              <NewPollContext.Provider value={[pollWinInfo, setPollWinInfo]}>
                <SessionView />
              </NewPollContext.Provider>
            }
          />
          <Route path="/newpoll" element={<InstructorPoll />} />
          <Route path="/roster" element={<Roster />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </EditPopupContext.Provider>
    </ClickerContext.Provider>
  );
}

export default InAppContainer;
