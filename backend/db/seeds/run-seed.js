const seed = require("./seed");
const db = require("../connection");

const users = require("./data/users");
const books = require("./data/books");
const loans = require("./data/loans");
const messages = require("./data/messages");

const runSeed = () => {
  return seed({ users, books, loans, messages }).then(() => db.end());
};

runSeed();