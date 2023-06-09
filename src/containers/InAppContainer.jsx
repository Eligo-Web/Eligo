// Eligo is a web application primarily used for in-class polls.
// Copyright (C) 2023  Eligo-Web <smodare1@jhu.edu> <ffernan9@jhu.edu>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { createContext, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PageNotFound } from "../components/BlankStates";
import InstructorPoll from "../components/InstructorPoll";
import CourseView from "../pages/CourseView";
import Overview from "../pages/Overview";
import Roster from "../pages/Roster";
import SessionView from "../pages/SessionView";
import Home from "../pages/Home";

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
          <Route path="/" element={<Home />} />
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
