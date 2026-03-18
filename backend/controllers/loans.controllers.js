const {
  selectLoans,
  insertLoan,
  updateLoanStatus,
} = require("../models/loans.models");

exports.getLoans = (req, res, next) => {
  console.log("QUERY:", req.query);  
  const { user_id } = req.query;

  selectLoans(user_id)
    .then((loans) => {
      res.status(200).send({ loans });
    })
    .catch(next);
};

exports.postLoan = (req, res, next) => {
  insertLoan(req.body)
    .then((loan) => {
      res.status(201).send({ loan });
    })
    .catch(next);
};

exports.patchLoanStatus = (req, res, next) => {
  const { loan_id } = req.params;
  const { status } = req.body;

  updateLoanStatus(loan_id, status)
    .then((loan) => {
      res.status(200).send({ loan });
    })
    .catch(next);
};