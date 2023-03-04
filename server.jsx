import App from "./src/App";
import * as db from "./src/data/db.jsx";

db.connect(process.env.DB_URI);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`EduPoll API at http://localhost:${PORT}/`);
});
