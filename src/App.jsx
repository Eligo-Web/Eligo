import { BrowserRouter } from "react-router-dom";
import InAppContainer from "./containers/InAppContainer";

function App() {
  return (
    <BrowserRouter>
      <InAppContainer />
    </BrowserRouter>
  );
}

export default App;
