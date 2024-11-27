const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const userSchema = require("../models/user.model");
const jwt = require("jsonwebtoken");

router.get("/login", async function (req, res, next) {
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
      const tokenPayload = {
        id: user._id,
        username: user.username,
      };
      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_KEY //|| "default_secret_key",
        ,{
          expiresIn: "3h", // Token expires in 1 hour
        }
      );
      return res.status(202).send({
        success: true,
        message: "authorizetion.",
        data: user,
        token: token,
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
