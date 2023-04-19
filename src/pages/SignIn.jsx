import axios from "axios";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import OAuth2Login from "react-simple-oauth2-login";
import { server } from "../ServerUrl";
import logo from "../assets/eligo-logo.svg";
import instructorIcon from "../assets/instructor-button.png";
import studentIcon from "../assets/student-button.png";

function SignIn() {
  const navigate = useNavigate();

  async function handleSignin(response, role) {
    let email = "";
    let name = "";
    let user = {};

    await axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${response.access_token}`
      )
      .then((res) => {
        email = res.data.email;
        name = res.data.given_name + " " + res.data.family_name;
      });

    await axios
      .get(`${server}/${role.toLowerCase()}/${email}`, {
        token: response.access_token,
      })
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
              console.log(res.data.message);
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
        <OAuth2Login
          authorizationUrl="https://accounts.google.com/o/oauth2/v2/auth"
          responseType="token"
          clientId={import.meta.env.VITE_CLIENT_ID}
          redirectUri="http://localhost:5173/signin"
          scope="https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
          onSuccess={(response) => {
            handleSignin(response, "STUDENT");
          }}
          onFailure={(response) => {
            console.log(response);
          }}
          render={({ onClick }) => (
            <Button variant="sign-in" className="large-title" onClick={onClick}>
              <img
                src={studentIcon}
                className="sign-in-icon"
                alt="Student sign in button illustration"
              />
              Student
            </Button>
          )}
        />
        <OAuth2Login
          authorizationUrl="https://accounts.google.com/o/oauth2/v2/auth"
          responseType="token"
          clientId={import.meta.env.VITE_CLIENT_ID}
          redirectUri="http://localhost:5173/signin"
          scope="https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
          onSuccess={(response) => {
            handleSignin(response, "INSTRUCTOR");
          }}
          onFailure={(response) => {
            console.log(response);
          }}
          render={({ onClick }) => (
            <Button variant="sign-in" className="large-title" onClick={onClick}>
              <img
                src={instructorIcon}
                className="sign-in-icon"
                alt="Instructor sign in button illustration"
              />
              Instructor
            </Button>
          )}
        />
      </div>
    </div>
  );
}

export default SignIn;
