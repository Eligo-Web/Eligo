import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();
  return (
    <div className="card-title d-flex justify-content-center align-items-center p-5 gap-5">
      <div
        className="m-5 p-5 gap-4 d-flex flex-column align-items-center"
        style={{ width: "60%" }}
      >
        <div className="blank-state-msg">Page Not Found</div>
        <Button
          variant="blank-state"
          className="large-title"
          onClick={() => navigate("/signin")}
        >
          Home
        </Button>
      </div>
    </div>
  );
}
