const messagesRouter = require("express").Router();
const {
  getMessages,
  postMessage,
} = require("../controllers/messages.controllers");

messagesRouter.get("/", getMessages);
messagesRouter.post("/", postMessage);

module.exports = messagesRouter;