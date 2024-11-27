const express = require("express");
const router = express.Router();
const orderSchema = require("../models/order.model");
const productSchema = require("../models/product.model");
const storeSchema = require("../models/store.model");
const verifyToken = require("../middleware/token.middleware");
const userSchema = require("../models/user.model");

/* GET orders listing. */
router.get("/customer/:customerid", verifyToken, async function (req, res, next) {
  try {
    let {customerid} = req.params;
    
    // Add ID validation
    if (!customerid || !customerid.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: `customerid:${customerid}`
      });
    }

    let token = req.user;
    if(token.id !== customerid || token.role !== 'admin'){ //check user
      return res.status(403).send({
        success: false,
        message: "forbidden",
        error: "user not match.",
      });
    }
    let customer = await userSchema.findById(customerid);
    if(!customer){ //check user exist
      return res.status(404).send({
        success: false,
        message: "user not found.",
        error: `id:${customerid}`,
      });
    }
    let orders = await orderSchema.find({ //get all orders by customer id
      customer_id: { $regex: customerid, $options: "i" },
    });
    if (!orders) { //check empty result
      return res.status(200).send({
        success: true,
        message: "get success.",
        data: [],
      });
    }
    return res.status(200).send({ ///get success
      success: true,
      message: "get success.",
      data: orders,
    });
  } catch (error) {
    return res.status(500).send({ //error handling
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.get("/",verifyToken, async function (req, res, next) { // get all orders ; admin
  try {
    let token = req.user;
    if(token.role !== 'admin'){ //check role
      return res.status(403).send({
        success: false,
        message: "forbidden",
        error: "user not match.",
      });
    }
    let admin = await userSchema.findById(token.id);
    if(!admin){ //check user exist
      return res.status(404).send({
        success: false,
        message: "user not found.",
        error: `id:${token.id}`,
      });
    }
    let orders = await orderSchema.find({});//get all orders by customer id
    if (!orders) { //check empty result
      return res.status(200).send({
        success: true,
        message: "get success.",
        data: [],
      });
    }
    return res.status(200).send({ ///get success
      success: true,
      message: "get success.",
      data: orders,
    });
  } catch (error) {
    return res.status(500).send({ //error handling
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.get("/customer/name",verifyToken, async function (req, res, next) { // search orders by customer name
  try {
    let { customername } = req.query;
    let token = req.user;
    if(token.role !== 'admin'){ //check role
      return res.status(403).send({
        success: false,
        message: "forbidden",
        error: "not perrmission.",
      });
    }
    let admin = await userSchema.findById(token.id);
    if(!admin){ //check user exist
      return res.status(404).send({
        success: false,
        message: "user not found.",
        error: `id:${token.id}`,
      });
    }
    let orders = await orderSchema.findOne({ //get all orders by customer name
      owner_name: { $regex: customername, $options: "i" } 
    });
    if (!orders) {
      return res.status(404).send({ //check exist order
        success: false,
        message: "order not found.",
        error: `customer name:${customername}`,
      });
    }
    return res.status(200).send({ //get success
      success: true,
      message: "get success.",
      data: order,
    });
  } catch (error) {
    return res.status(500).send({ //error handling
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.post("/new", verifyToken, async function (req, res, next) {
  try {
    let token = req.user;
    let { customer_id, customer_name, storeObj, products } = req.body;

    // Add ID validation
    if (!customer_id || !customer_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: `customer_id:${customer_id}`
      });
    }

    if(token.id !== customer_id){
      return res.status(403).send({ //check user
        success: false,
        message: "forbidden",
        error: "permission denied.",
      });
    }
    if (products<=0) { //check product amount error
      return res
        .status(400)
        .send({
          success: false,
          message: "bad request.",
          error: "products must not empty.",
        });
    }
    let out_of_stock = [];
    let product_have_stock = [];
    let product_amounts = [];
    let product_remain = [];
    let error_amount_number = [];
    let error_product_name = [];
    
    //find and save remember product stock
    for (let i = 0; i < order.products.length; i++) {
      //check amount format
      if (products[i].amount < 1) {
        error_amount_number.push(products[i].amount);
        error_product_name.push(products[i].product_name);
      }
      let product = await productSchema.findById(products[i]._id);
      let product_name;
      if (!product) {
        return res.status(404).send({
          success: false,
          message: "id not found.",
          error: `id:${products[i]._id}`,
        });
      }
      if (product.stock >= products[i].amount) {
        product_amounts.push(products[i].amount);
        product_remain.push(product.stock - products[i].amount);
        product_name = product._id;
        product_have_stock.push(product_name);
      } else {
        product_name = products[i].product_name;
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
    let total_price = 0;
    if (out_of_stock.length > 0) {
      return res.status(400).send({
        success: false,
        message: "product out of stock",
        error: out_of_stock,
      });
    } else {
      for (let index in product_have_stock) {
        let updateAmount = await productSchema.findByIdAndUpdate(
          product_have_stock[index],
          { remain: product_remain[index] },
          { new: true }
        );
        total_price += updateAmount.price * product_amounts[index];
      }
      let order = new orderSchema({
        customer_id: customer_id,
        customer_name: customer_name,
        storeObj: storeObj,
        products: products,
        total_price: total_price,
      });
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

router.delete("/cancle", verifyToken, async function (req, res, next) {
  try {
    let token = req.user;
    let { orderid, customerid } = req.query;

    // Add ID validation for both IDs
    if (!orderid || !orderid.match(/^[0-9a-fA-F]{24}$/) || !customerid || !customerid.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: `orderid:${orderid}, customerid:${customerid}`
      });
    }

    if(token.id !== customerid){
      return res.status(403).send({ //check user
        success: false,
        message: "forbidden",
        error: "permission denied.",
      });
    }
    let order = await orderSchema.findById(orderid);
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "id not found.",
        error: `id:${orderid}`,
      });
    }
    //find and save remember product stock
    for (const element of order.products) {
      let product = await productSchema.findById(element._id);
      if (!product) {
        return res.status(404).send({
          success: false,
          message: "id not found.",
          error: `id:${element._id}`,
        });
      }
      let product_id = product._id;
      let product_remain = element.amount + product.stock;
      await productSchema.findByIdAndUpdate(
        product_id,
        { stock: product_remain },
        { new: true }
      );
    }
    await orderSchema.findByIdAndDelete(orderid);
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
