var express = require("express");
var router = express.Router();
var userSchema = require("../models/user.model");
// const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/token.middleware");

/* GET users listing. */
router.get("/",/*verifyToken,*/ async function (req, res, next) {
  try {
    let users = await userSchema.find({});
    return res.status(200).send({
      success: true,
      message: "get success.",
      data: users,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    let { id } = req.params;
    let user = await userSchema.findOne({ user_id: `${id}` });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found.",
        error: `id:${id}`,
      });
    }
    return res.status(200).send({
      success: true,
      message: "get success.",
      data: user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.post("/", async function (req, res, next) {
  try {
    let { user_id, username, password, firstname, lastname, age, sex } =
      req.body;
    let user = new userSchema({
      user_id: user_id,
      username: username,
      password: await bcrypt.hash(password, 10),
      firstname: firstname,
      lastname: lastname,
      age: age,
      sex: sex,
    });
    await user.save();
    let token = await jwt.sign({ foo: "bar" }, "1234");
    return res.status(201).send({
      success: true,
      message: "create success.",
      token: token,
      data: user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    let { user_id, username, password, firstname, lastname, age, sex } =
      req.body;
    let { id } = req.params;
    let user = await userSchema.findOne({ user_id: `${id}` });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found.",
        error: `id:${id}`,
      });
    }
    await userSchema.findOneAndUpdate(
      { user_id: id },
      { user_id, username, password, firstname, lastname, age, sex },
      { new: true }
    );

    return res.status(201).send({
      success: true,
      message: "update success.",
      data: user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    let { id } = req.params;
    let user = await userSchema.findOne({ user_id: id });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found.",
        error: "id not found",
      });
    }
    await userSchema.findOneAndDelete({ user_id: id });
    return res.status(200).send({
      success: true,
      message: "delete success.",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
    });
  }
});

module.exports = router;
