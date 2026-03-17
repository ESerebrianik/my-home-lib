const messagesRouter = require("express").Router();

messagesRouter.get("/", (req, res) => {
  res.status(200).send({ msg: "messages route working" });
});

module.exports = messagesRouter;