import { IconBook, IconSchool } from "@tabler/icons-react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";

function SignIn() {
  const server = "http://localhost:3000";
  const navigate = useNavigate();

  async function handleSignin(name, email, role) {
    let user = {};
    await axios
      .get(`${server}/${role.toLowerCase()}/${email}`)
      .then(async (res) => {
        if (res.data.status === 200) {
          user = res.data.data;
        } else {
          await axios
            .post(`${server}/${role.toLowerCase()}`, {
              name: name,
              email: email,
              role: role,
            })
            .then((res) => {
              console.log(res);
              user = res.data.data;
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
      state: {
        permission: user.role,
        email: user.email,
        name: user.name,
        history: user.history,
        clickerId: user.clickerId,
      },
    });
  }
  return (
    <div className="sign-in-title">
      Sign In
      <div className="sign-in-wrapper">
        <Button
          variant="sign-in"
          className="large-title"
          onClick={() =>
            handleSignin("Student Name", "student@jhu.edu", "STUDENT")
          }
        >
          <IconSchool size="8em" stroke={1} className="sign-in-icon" />
          Student
        </Button>
        <Button
          variant="sign-in"
          className="large-title"
          onClick={() =>
            handleSignin("Instructor Name", "instructor@jhu.edu", "INSTRUCTOR")
          }
        >
          <IconBook size="8em" stroke={1} className="sign-in-icon" />
          Instructor
        </Button>
      </div>
    </div>
  );
}

export default SignIn;
