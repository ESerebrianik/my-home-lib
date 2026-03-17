const usersRouter = require("express").Router();
const { getUsers } = require("../controllers/users.controllers");
const { getBooksByUserId } = require("../controllers/books.controllers");

usersRouter.get("/", getUsers);
usersRouter.get("/:user_id/books", getBooksByUserId);

module.exports = usersRouter;