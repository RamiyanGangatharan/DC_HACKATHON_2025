import express from "express";
import cors from "cors";
import Stops from "./stops.js";
import getTripUpdates from "./getTripUpdates.js";
const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/stops", Stops);
app.use("/getTripUpdates", getTripUpdates);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});