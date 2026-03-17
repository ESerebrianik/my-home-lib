exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  }
  next(err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code === "22P02") {
    return res.status(400).send({ msg: "Bad request" });
  }

  if (err.code === "23503") {
    return res.status(404).send({ msg: "Related resource not found" });
  }

  if (err.code === "23502") {
    return res.status(400).send({ msg: "Missing required field" });
  }

  next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  console.error(err);
  res.status(500).send({ msg: "Internal server error" });
};