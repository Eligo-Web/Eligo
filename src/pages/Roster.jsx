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

import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BackButton } from "../components/Buttons";
import Menu from "../components/Menu";
import MenuBar from "../components/MenuBar";
import pause, { decodeEmail } from "../components/Utils";

function Roster() {
  const location = useLocation();
  const navigate = useNavigate();
  const students = location.state.students; // map of encoded student emails to student names
  const [UP, DOWN] = ["ascending", "descending"];
  const [sortName, setSortName] = useState(false);
  const [sortEmail, setSortEmail] = useState(false);
  const [roster, setRoster] = useState(null);
  const [list, setList] = useState(new Map(Object.entries(students)));
  // const [list, setList] = useState(sampleList());
  const compareValues = (a, b) => a[1].localeCompare(b[1]);

  function sampleList() {
    const newList = new Map();
    for (let i = 0; i < 500; i++) {
      const email = Math.random().toString(36).slice(2, 10);
      const name = Math.random().toString(10).slice(2, 10);
      newList.set(`${email}@jhu$edu`, name);
    }
    return newList;
  }

  function listArray() {
    return [...list.entries()];
  }

  useEffect(() => {
    async function updateRoster() {
      const rosterItems = document.getElementById("roster-content");
      rosterItems.style.opacity = 0;
      await pause(75);
      populateRoster();
      await pause(75);
      document.querySelector(".roster-wrapper").scrollTop = 0;
      rosterItems.style.opacity = 1;
    }
    if (list) {
      updateRoster();
    }
  }, [list]);

  function populateRoster() {
    const rosterList = [];
    for (let [email, name] of list) {
      rosterList.push(
        <div className="roster-item" key={email}>
          <div className="card-title">{name}</div>
          <div className="card-subtitle">{decodeEmail(email)}</div>
        </div>
      );
    }
    setRoster(rosterList);
  }

  function handleSortName() {
    if (!sortName) {
      setSortName(UP);
      setList(new Map(listArray().sort(compareValues)));
      setSortEmail(false);
    } else {
      switch (sortName) {
        case UP:
          setSortName(DOWN);
          break;
        case DOWN:
          setSortName(UP);
          break;
      }
      setList(new Map(listArray().reverse()));
    }
  }

  function handleSortEmail() {
    if (!sortEmail) {
      setSortEmail(UP);
      setList(new Map(listArray().sort()));
      setSortName(false);
    } else {
      switch (sortEmail) {
        case UP:
          setSortEmail(DOWN);
          break;
        case DOWN:
          setSortEmail(UP);
          break;
      }
      setList(new Map(listArray().reverse()));
    }
  }

  function IconSort(props) {
    switch (props.selector) {
      case UP:
        return (
          <IconArrowUp
            size="2rem"
            style={{ display: props.selector ? "flex" : "none" }}
          />
        );
      case DOWN:
        return (
          <IconArrowDown
            size="2rem"
            style={{ display: props.selector ? "flex" : "none" }}
          />
        );
    }
  }

  return (
    <div>
      <BackButton
        label={location.state.courseName}
        onClick={() => navigate("/class", { state: location.state })}
      />
      <div className="roster-header">
        <div className="roster-buttons" onClick={() => handleSortName()}>
          <IconSort selector={sortName} />
          Name
        </div>
        <div className="roster-buttons" onClick={() => handleSortEmail()}>
          <IconSort selector={sortEmail} />
          Email
        </div>
      </div>
      <div className="roster-wrapper">
        <Menu hideCreate />
        <MenuBar title="Roster" />
        <div id="roster-content" style={{ transition: "0.1s ease-in-out" }}>
          {roster}
        </div>
      </div>
    </div>
  );
}

export default Roster;
