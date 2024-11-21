var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
var userSchema = require("../models/user.model");

router.get("/", async function (req, res, next) {
  try {
    let { username, password } = req.query;
    let user = await userSchema.findOne({ username: username });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "username not found.",
        error: `username:${username}`,
      });
    }
    let auth_bool = await bcrypt.compare(password, user.password);
    if (auth_bool) {
      return res.status(202).send({
        success: true,
        message: "authorizetion.",
        data: user,
      });
    } else {
      return res.status(401).send({
        success: false,
        message: "unauthorization",
        errors: `wrong password.`,
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

module.exports = router;
