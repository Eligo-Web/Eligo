import app from "./src/ExpressApp.js";
import * as db from "./src/data/db.js";

db.connect(process.env.DB_URI);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`EduPoll API at http://localhost:${PORT}/`);
});
