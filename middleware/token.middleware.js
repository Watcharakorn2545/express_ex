const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorizetion;
    // const decoded = jwt.decode(token, process.env.JWT_KEY);
    if (token)
      return res.status(401).send({
        success: false,
        message: "token invalid.",
      });
    req.auth = token;
    next();
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
};
