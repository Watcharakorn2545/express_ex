var express = require("express");
var router = express.Router();
var productSchema = require("../models/product.model");
const jwt = require("jsonwebtoken");
const tokenMiddleware = require("../middleware/token.middleware");

/* GET products listing. */
router.get("/", async function (req, res, next) {
  try {
    let products = await productSchema.find({});
    return res.status(200).send({
      success: true,
      message: "get success.",
      data: products,
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
    let product = await productSchema.findOne({ product_id: id });
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "id not found.",
        error: `id:${id}`,
      });
    }
    return res.status(200).send({
      success: true,
      message: "get success.",
      data: product,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.post("/", tokenMiddleware, async function (req, res, next) {
  try {
    let { product_id, name, detail, price, remain } = req.body;
    let product = new productSchema({
      product_id: product_id,
      name: name,
      detail: detail,
      price: price,
      remain: remain,
    });
    await product.save();
    let token = await jwt.sign({ foo: "bar" }, "1234");
    return res.status(201).send({
      success: true,
      message: "create success.",
      data: product,
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
    let { product_id, name, detail, price, remain } = req.body;
    let { id } = req.params;
    let product = await productSchema.findOne({ product_id: id });
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "id not found.",
        error: `id${id}`,
      });
    }
    await productSchema.findOneAndUpdate(
      { product_id: id },
      { product_id, name, detail, price, remain },
      { new: true }
    );

    return res.status(201).send({
      success: true,
      message: "update success.",
      data: product,
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
    let product = await productSchema.findOne({ product_id: id });
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "id not found.",
        error: `id:${id}`,
      });
    }
    await productSchema.findOneAndDelete({ product_id: id });
    return res.status(200).send({
      success: true,
      message: "delete success.",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

module.exports = router;
