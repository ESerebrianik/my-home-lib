const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes/api.router");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

module.exports = app;