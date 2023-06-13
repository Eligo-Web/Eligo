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

import axios from "axios";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { server } from "../ServerUrl";
import logo from "../assets/eligo-logo.svg";
import instructorIcon from "../assets/instructor-button.png";
import studentIcon from "../assets/student-button.png";

function Home() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const encodedUser = urlParams.get("user");
  if (encodedUser) {
    const decodedUser = atob(encodedUser);
    const parsedUser = JSON.parse(decodedUser || "{}");

    if (parsedUser) {
      handleRedirect(parsedUser);
    }
  }

  async function handleRedirect(props) {
    let user = {};
    let role = sessionStorage.getItem("role");
    const fullName = `${props.firstName} ${props.lastName}`;
    await axios
      .get(`${server}/${role.toLowerCase()}/${props.email}`)
      .then(async (res) => {
        if (res.data.status === 200) {
          user = res.data.data;
        } else if (res.data.status === 404) {
          await axios
            .post(`${server}/${role.toLowerCase()}`, {
              name: fullName,
              email: props.email,
              role: role,
            })
            .then((res) => {
              user = res.data.data;
            });
        }
      });
    navigate("/overview", {
      state: {
        permission: user.role,
        email: user.email,
        name: user.name,
        history: user.history,
        clickerId: user.clickerId,
      },
    });
  }

  async function handleSignin(role) {
    sessionStorage.setItem("role", role.toUpperCase());
    await axios.get(`${server}/${role.toLowerCase()}/signin`).then((res) => {
      if (res.data.status === 500) {
        navigate("/overview", {
          state: {
            permission: undefined,
          },
        });
      } else {
        window.location.href = res.data.data;
      }
    });
  }
  return (
    <div className="sign-in-container">
      <title>Sign in | Eligo</title>
      <div className="sign-in-title" id="Eligo">
        <img
          className="eligo-logo sign-in-logo"
          src={logo}
          alt="Eligo brand logo."
        />
        ligo
      </div>
      <div className="sign-in-content">
        <Button
          variant="sign-in"
          className="large-title"
          onClick={() => handleSignin("STUDENT")}
        >
          <img
            src={studentIcon}
            className="sign-in-icon"
            alt="Student sign in button illustration"
          />
          Student
        </Button>
        <Button
          variant="sign-in"
          className="large-title"
          onClick={() => handleSignin("INSTRUCTOR")}
        >
          <img
            src={instructorIcon}
            className="sign-in-icon"
            alt="Instructor sign in button illustration"
          />
          Instructor
        </Button>
      </div>
    </div>
  );
}

export default Home;
