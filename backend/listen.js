const app = require("./app");

const PORT = process.env.PORT || 9090;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}...`);
});