const loansRouter = require("express").Router();

loansRouter.get("/", (req, res) => {
  res.status(200).send({ msg: "loans route working" });
});

module.exports = loansRouter;