var express = require("express");
var router = express.Router();
var orderSchema = require("../models/order.model");
var productSchema = require("../models/product.model");

/* GET orders listing. */
router.get("/", async function (req, res, next) {
  try {
    let {buyer_name} = req.query;
    let orders;
    if (buyer_name) {
      orders = await orderSchema.find({buyer_name:buyer_name})
      return res.status(200).send({
        success: true,
        message: "get success.",
        data: orders
      });
    }
    orders = await orderSchema.find({});
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
    let order = await orderSchema.findOne({order_id: id});
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

router.post("/", async function (req, res, next) {
  try {
    //declear variables
    let { order_id, buyer_name, products, total_price } = req.body;
    if (products<=0) {
      return res
        .status(400)
        .send({
          success: false,
          message: "bad request.",
          error: "products must not empty.",
        });
    }
    let order = new orderSchema({
      order_id: order_id,
      buyer_name: buyer_name,
      products: products,
      total_price: total_price,
    });
    let out_of_stock = [];
    let product_have_stock = [];
    let product_remain = [];
    let error_amount_number = [];
    let error_product_name = [];

    //find and save remember product stock
    for (let i = 0; i < order.products.length; i++) {
      //check amount format
      if (products[i].amount < 1) {
        error_amount_number.push(products[i].amount);
        error_product_name.push(products[i].name);
      }
      console.log("product name==>",products[i].name);
      
      let product = await productSchema.findOne({ name: products[i].name });
      console.log("product ==>", product);
      let product_name;
      if (product===null) {
        return res.status(404).send({
          success: false,
          message: "id not found.",
          error: `name:${products[i].name}`,
        });
      }
      if (product.remain >= products[i].amount) {
        product_remain.push(product.remain - products[i].amount);
        product_name = product.product_id;
        product_have_stock.push(product_name);
      } else {
        product_name = products[i].name;
        out_of_stock.push(product_name);
      }
    }
    if (error_amount_number.length > 0 && error_product_name.length > 0) {
      return res.status(400).send({
        success: false,
        message: "bad request",
        error: error_product_name.map(
          (item, index) => `${item}:${error_amount_number[index]}`
        ),
      });
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
      return res.status(201).send({
        success: true,
        message: "create success.",
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
    //declear variables
    let { id } = req.params;
    //find order by id
    let order = await orderSchema.findOne({ order_id: id });
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "id not found.",
        error: `id:${id}`,
      });
    }
    //find and save remember product stock
    for (let i = 0; i < order.products.length; i++) {
      let product = await productSchema.findOne({
        name: order.products[i].name,
      });
      if (!product) {
        return res.status(404).send({
          success: false,
          message: "id not found.",
          error: `id:${id}`,
        });
      }
      let product_id = product.product_id;
      let product_remain = order.products[i].amount + product.remain;
      await productSchema.findOneAndUpdate(
        { product_id: product_id },
        { remain: product_remain },
        { new: true }
      );
    }
    await orderSchema.findOneAndDelete({ order_id: id });
    return res.status(200).send({
      success: true,
      message: "delete success",
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
