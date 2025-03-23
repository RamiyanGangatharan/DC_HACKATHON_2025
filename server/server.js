import express from "express";
import cors from "cors";
import Stops from "./stops.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/stops", Stops);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});