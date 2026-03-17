const apiRouter = require("express").Router();
const usersRouter = require("./users.router");
const booksRouter = require("./books.router");
const loansRouter = require("./loans.router");
const messagesRouter = require("./messages.router");

apiRouter.get("/", (req, res) => {
  res.status(200).send({ msg: "My Home Lib API" });
});

apiRouter.use("/users", usersRouter);
apiRouter.use("/books", booksRouter);
apiRouter.use("/loans", loansRouter);
apiRouter.use("/messages", messagesRouter);

module.exports = apiRouter;