const {
  selectMessagesBetweenUsers,
  insertMessage,
} = require("../models/messages.models");

exports.getMessages = (req, res, next) => {
  const { user1, user2 } = req.query;

  selectMessagesBetweenUsers(user1, user2)
    .then((messages) => {
      res.status(200).send({ messages });
    })
    .catch(next);
};

exports.postMessage = (req, res, next) => {
  insertMessage(req.body)
    .then((message) => {
      res.status(201).send({ message });
    })
    .catch(next);
};