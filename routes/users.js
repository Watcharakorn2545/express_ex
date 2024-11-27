const express = require("express");
const router = express.Router();
const userSchema = require("../models/user.model");
const bcrypt = require("bcrypt");
const verifyToken = require("../middleware/token.middleware");

router.get("/", verifyToken, async function (req, res, next) {
  //get all users ;admin only
  try {
    let token = req.user;
    if (token.role !== "admin") {
      //check role
      return res.status(401).send({
        success: false,
        message: "unauthorization.",
      });
    }
    let users = await userSchema.find({});
    return res.status(200).send({
      //success
      success: true,
      message: "get success.",
      data: users,
    });
  } catch (error) {
    // error handling
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.get("/:id", verifyToken, async function (req, res, next) {
  //get user by id ;admin and self only
  try {
    let token = req.user;
    let { id } = req.params;
    // Check if ID is valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: `id:${id}`
      });
    }
    let user = await userSchema.findById(id);
    if (!user) {
      //check user exist
      return res.status(404).send({
        success: false,
        message: "user not found.",
        error: `id:${id}`,
      });
    }
    if (token.id === req.params.id || token.role === "admin") {
      //check role or self
      return res.status(200).send({
        success: true,
        message: "get success.",
        data: user,
      });
    }
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: error.message
      });
    }
    // error handling
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.post("/customer", async function (req, res, next) {
  // create customer ;customer only
  try {
    let { username, password, firstname, lastname, age, sex, email, phone } =
      req.body;
    let user = new userSchema({
      //create customer model
      username: username,
      password: await bcrypt.hash(password, 10),
      firstname: firstname,
      lastname: lastname,
      age: age,
      sex: sex,
      email: email,
      phone: phone,
    });
    await user.save(); //save to database
    return res.status(201).send({
      //create success
      success: true,
      message: "create success.",
      data: user,
    });
  } catch (error) {
    // error handling
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.post("/admin", verifyToken,async function (req, res, next) {
  // create admin ;admin only
  try {
    if (req.user.role !== "admin") {
      //check role
      return res.status(401).send({
        success: false,
        message: "unauthorization.",
      });
    }
    let { username, password, firstname, lastname, age, sex, email, phone } =
      req.body;
    let user = new userSchema({
      // create admin model
      username: username,
      password: await bcrypt.hash(password, 10),
      firstname: firstname,
      lastname: lastname,
      role: "admin",
      age: age,
      sex: sex,
      email: email,
      phone: phone,
    });
    await user.save(); // save to database
    return res.status(201).send({
      //create success
      success: true,
      message: "create success.",
      data: user,
    });
  } catch (error) {
    // error handling
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.put("/update/:id", verifyToken, async function (req, res, next) {
  try {
    let { username, password, firstname, lastname, age, sex, email, phone } = req.body;
    let { id } = req.params;
    
    // Check if ID is valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: `id:${id}`
      });
    }

    let user = await userSchema.findById(id);
    if (!user) {
      //check user exist
      return res.status(404).send({
        success: false,
        message: "user not found.",
        error: `id:${id}`,
      });
    }
    let token = req.user;
    if (token.id !== id) {
      //check self id and update
      return res.status(401).send({
        success: false,
        message: "unauthorization.",
        error: `id:${id}`,
      });
    }
    let updateUser = await userSchema.findByIdAndUpdate(
      id,
      { username:username, password:password, firstname:firstname, lastname:lastname, age:age, sex:sex, email:email, phone:phone },
      { new: true }
    );
    return res.status(201).send({ //update success
      success: true,
      message: "update success.",
      data: updateUser,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: error.message
      });
    }
    return res.status(500).send({
      success: false,
      message: "internal server error.",
      error: error
    });
  }
});
router.delete("/:id",verifyToken, async function (req, res, next) { // delete user ;admin and self only
  try {
    let token = req.user;
    let { id } = req.params;
    if (token.id !== id && token.role !== 'admin') { //check self id and delete
      return res.status(401).send({
        success: false,
        message: "unauthorization.",
      });
    }
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: `id:${id}`
      });
    }
    let user = await userSchema.findById(id);
    if (!user) { //check user exist
      return res.status(404).send({
        success: false,
        message: "user not found.",
        error: "id not found",
      });
    }
    await userSchema.findByIdAndDelete(id); // find and delete
    return res.status(200).send({ ///delete success
      success: true,
      message: "delete success.",
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: error.message
      });
    }
    return res.status(500).send({// error handling
      success: false,
      message: "internal sever error.",
    });
  }
});

module.exports = router;
