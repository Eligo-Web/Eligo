import Button from "react-bootstrap/Button";
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
        if (
          res.data.data.length === 0 ||
          res.data.data[0].email !== email ||
          res.data.data[0].role !== role
        ) {
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

  async function handleInstructor() {
    let email = "instructor@jhu.edu";
    let name = "instructor";
    let role = "INSTRUCTOR";
    let history = { "Intersession 2023": [], "Spring 2023": [] };
    await axios
      .get(`${server}/instructor/${email}`)
      .then((res) => {
        if (res.data.status === 200) {
          email = res.data.data.email;
          name = res.data.data.name;
          role = res.data.data.role;
          history = res.data.data.history;
        } else {
          axios
            .post(`${server}/instructor`, {
              name: name,
              email: email,
              role: role,
              history: history,
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
      state: { permission: role, email: email, name: name, history: history },
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
          <IconSchool size="8em" stroke={1} className="sign-in-icon" />
          Student
        </Button>
        <Button
          variant="sign-in"
          className="large-title"
          onClick={handleInstructor}
        >
          <IconBook size="8em" stroke={1} className="sign-in-icon" />
          Instructor
        </Button>
      </div>
    </div>
  );
}

export default SignIn;
