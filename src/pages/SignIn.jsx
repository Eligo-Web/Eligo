import { Button } from "react-bootstrap";
import { IconBook, IconSchool } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SignIn(props) {
  const server = "http://localhost:3000";
  const navigate = useNavigate();
  function handleStudent() {
    const email = "student@jhu.edu";
    const name = "student";
    const role = "STUDENT";
    axios
      .get(`${server}/student/?email=${email}`)
      .then((res) => {
        console.log(res);
        if (res.data.data.length === 0) {
          axios
            .post(`${server}/student`, {
              name: name,
              email: email,
              role: role,
            })
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
    navigate("/overview", {
      state: { permission: "student", email: email },
    });
  }
  function handleInstructor() {
    const email = "instructor@jhu.edu";
    const name = "instructor";
    const role = "INSTRUCTOR";
    axios
      .get(`${server}/instructor/?email=${email}`)
      .then((res) => {
        console.log(res);
        if (res.data.data.length === 0) {
          axios
            .post(`${server}/instructor`, {
              name: name,
              email: email,
              role: role,
            })
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
    navigate("/overview", {
      state: { permission: "instructor", email: email },
    });
  }
  return (
    <div className="sign-in-title">
      Sign In
      <div className="sign-in-wrapper">
        <Button
          variant="sign-in"
          className="large-title"
          onClick={handleStudent}
        >
          <IconSchool size="12rem" stroke={1} className="sign-in-icon" />
          Student
        </Button>
        <Button
          variant="sign-in"
          className="large-title"
          onClick={handleInstructor}
        >
          <IconBook size="12rem" stroke={1} className="sign-in-icon" />
          Instructor
        </Button>
      </div>
    </div>
  );
}

export default SignIn;
