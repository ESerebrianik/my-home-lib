const {
  selectBooksByUserId,
  insertBook,
  deleteBookById,
} = require("../models/books.models");

exports.getBooksByUserId = (req, res, next) => {
  const { user_id } = req.params;
  const { collection } = req.query;

  selectBooksByUserId(user_id, collection || "library")
    .then((books) => {
      res.status(200).send({ books });
    })
    .catch(next);
};

exports.postBook = (req, res, next) => {
  insertBook(req.body)
    .then((book) => {
      res.status(201).send({ book });
    })
    .catch(next);
};

exports.removeBook = (req, res, next) => {
  const { book_id } = req.params;

  deleteBookById(book_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};