import InAppContainer from "./containers/InAppContainer";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <InAppContainer />
    </BrowserRouter>
  );
}

export default App;
