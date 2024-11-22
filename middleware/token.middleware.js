const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).send({
        success: false,
        message: "token invalid.",
      });
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(
      token,
      process.env.JWT_KEY //|| "default_secret_key"
    );
    req.auth = decoded;
    next();
  } catch (error) {
    return res.status(401).send({
      success: false,
      message: "auth failed.",
      error: error,
    });
  }
};
