const booksRouter = require("express").Router();
const { postBook, removeBook } = require("../controllers/books.controllers");

booksRouter.post("/", postBook);
booksRouter.delete("/:book_id", removeBook);

module.exports = booksRouter;