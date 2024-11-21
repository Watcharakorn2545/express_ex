var express = require("express");
var router = express.Router();
var orderSchema = require("../models/order.model");
var productSchema = require("../models/product.model");
const jwt = require("jsonwebtoken");
const tokenMiddleware = require("../middleware/token.middleware");

/* GET orders listing. */
router.get("/", async function (req, res, next) {
  try {
    let orders = await orderSchema.find({});
    return res.status(200).send({
      success: true,
      message: "get success.",
      data: orders,
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
    let order;
    if (typeof id === "string") {
      order = await orderSchema.findOne({
        buyer_name: { $regex: new RegExp(id, "i") },
      });
    }
    if (typeof id === "number") {
      order = await orderSchema.findOne({ order_id: id });
    }
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "id not found.",
        error: `id:${id}`,
      });
    }
    return res.status(200).send({
      success: true,
      message: "get success.",
      data: order,
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
    //declear variables
    let { order_id, buyer_name, products, total_price } = req.body;
    let order = new orderSchema({
      order_id: order_id,
      buyer_name: buyer_name,
      products: products,
      total_price: total_price,
    });
    let out_of_stock = [];
    let product_have_stock = [];
    let product_remain = [];

    //find and save remember product stock
    for (let i = 0; i < order.products.length; i++) {
      let product = await productSchema.findOne({ name: products[i].name });
      let product_name;
      if (product.remain >= products[i].amount) {
        product_remain.push(product.remain - products[i].amount);
        product_name = product.product_id;
        product_have_stock.push(product_name);
      } else {
        product_name = products[i].name;
        out_of_stock.push(product_name);
      }
    }
    if (out_of_stock.length > 0) {
      return res.status(400).send({
        success: false,
        message: "product out of stock",
        error: out_of_stock,
      });
    } else {
      for (let index in product_have_stock) {
        await productSchema.findOneAndUpdate(
          { product_id: product_have_stock[index] },
          { remain: product_remain[index] },
          { new: true }
        );
      }
      await order.save();
      let token = await jwt.sign({ foo: "bar" }, "1234");
      return res.status(201).send({
        success: true,
        message: "create success.",
        token: token,
        data: order,
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

router.delete("/:id", async function (req, res, next) {
  try {
    let { id } = req.params;
    let order = await orderSchema.findOne({ order_id: id });
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "id not found.",
        error: `id:${id}`,
      });
    }
    await orderSchema.findOneAndDelete({ order_id: id });

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
