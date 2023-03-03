import { Button } from "react-bootstrap";
import { IconBook, IconSchool } from "@tabler/icons-react";

function SignIn(props) {
  return (
    <div className="sign-in-title">
      Sign In
      <div className="sign-in-wrapper">
        <Button variant="sign-in" className="large-title">
          <IconSchool size="12rem" stroke={1} className="sign-in-icon" />
          Student
        </Button>
        <Button variant="sign-in" className="large-title">
          <IconBook size="12rem" stroke={1} className="sign-in-icon" />
          Instructor
        </Button>
      </div>
    </div>
  );
}

export default SignIn;
