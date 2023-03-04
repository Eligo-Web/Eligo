import { Button } from "react-bootstrap";
import { IconBook, IconSchool } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";


function SignIn(props) {
  const navigate = useNavigate();
  function handleStudent() {
    navigate("/overview", {
      state: { permission: "student", email: "student@jhu.edu" },
    });
  }
  function handleInstructor() {
    navigate("/overview", {
      state: { permission: "instructor", email: "instructor@jhu.edu" },
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
