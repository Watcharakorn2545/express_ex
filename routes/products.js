const express = require("express");
const router = express.Router();
const productSchema = require("../models/product.model");
const verifyToken = require("../middleware/token.middleware");
const storeSchema = require("../models/store.model");

/* GET products listing. */
router.get("/", async function (req, res, next) {
  // get all products
  try {
    let products = await productSchema.find({});
    return res.status(200).send({
      //get success
      success: true,
      message: "get success.",
      data: products,
    });
  } catch (error) {
    return res.status(500).send({
      //error handling
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.get("/category", async function (req, res, next) {
  // get products by category
  try {
    let { category } = req.query;
    let products = await productSchema.find({
      categories: { $regex: category, $options: "i" },
    });
    if (!products) {
      //check empty result
      return res.status(200).send({
        success: true,
        message: `category:${category} not match.`,
        data: [],
      });
    }
    return res.status(200).send({
      //get success
      success: true,
      message: "get success.",
      data: products,
    });
  } catch (error) {
    return res.status(500).send({
      //error handling
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.get("/name", async function (req, res, next) {
  // get products by name
  try {
    let { name } = req.query;
    let products = await productSchema.find({
      product_name: { $regex: name, $options: "i" },
    });
    if (!products) {
      //check empty result
      return res.status(200).send({
        success: true,
        message: `name:${name} not match.`,
        data: [],
      });
    }
    return res.status(200).send({
      //get success
      success: true,
      message: "get success.",
      data: products,
    });
  } catch (error) {
    return res.status(500).send({
      //error handling
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.post("/new/:storeid", verifyToken, async function (req, res, next) {
  try {
    let token = req.user;
    let {storeid} = req.params;

    // Add ID validation
    if (!storeid || !storeid.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: `storeid:${storeid}`
      });
    }

    if(token.role !== 'merchant'){ //check role
      return res.status(403).send({
        success: false,
        message: "forbidden",
        error: "only merchant can create product.",
      });
    }
    let store = await storeSchema.findById(storeid);
    if(store.owner_id !== token.id){ //check store owner
      return res.status(403).send({
        success: false,
        message: "forbidden",
        error: "merchant not an owner of store.",
      });
    }
    let { product_name, store_id, categories, description, price,stock } = req.body;
    let product = new productSchema({ //create new product
      product_name: product_name,
      store_id: store_id,
      categories: categories,
      description: description,
      price: price,
      stock: stock,
    });
    if (price < 0 || stock < 0) { //check price and stock number error
      return res.status(400).send({
        success: false,
        message: "bad request",
        error: "price and remain must greater than zero.",
        data: req.body,
      });
    }
    await product.save(); //save new product
    return res.status(201).send({ //create success
      success: true,
      message: "create success.",
      data: product,
    });
  } catch (error) { //error handling
    return res.status(500).send({
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});
router.put("/update", verifyToken, async function (req, res, next) {
  try {
    let token = req.user;
    let {productid, storeid} = req.query;

    // Add ID validation for both IDs
    if (!productid || !productid.match(/^[0-9a-fA-F]{24}$/) || !storeid || !storeid.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: `productid:${productid}, storeid:${storeid}`
      });
    }

    if(token.role !== 'merchant'){ //check role
      return res.status(403).send({
        success: false,
        message: "forbidden",
        error: "only merchant can create product.",
      });
    }
    let store = await storeSchema.findById(storeid);
    if(store.owner_id !== token.id){ //check store owner
      return res.status(403).send({
        success: false,
        message: "forbidden",
        error: "merchant not an owner of store.",
      });
    }
      let { product_name, categories, description, price,stock } = req.body;
    if (price < 0 || remain < 0) { //check price and stock number error
      return res.status(400).send({
        success: false,
        message: "bad request",
        error: "price and remain must greater than zero.",
      });
    }
    let product = await productSchema.findById(productid);
    if (!product) { //check product exist
      return res.status(404).send({
        success: false,
        message: "product not found.",
        error: `id${productid}`,
      });
    }
    let updateProduct = await productSchema.findByIdAndUpdate( //find and update product
      productid,
      { product_name:product_name, categories:categories, description:description, price:price,stock:stock },
      { new: true }
    );
    return res.status(201).send({ //update success
      success: true,
      message: "update success.",
      data: updateProduct,
    });
  } catch (error) {
    return res.status(500).send({ //error handling
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.delete("/remove", verifyToken, async function (req, res, next) {
  try {
    let token = req.user;
    let {productid, storeid} = req.query;

    // Add ID validation for both IDs
    if (!productid || !productid.match(/^[0-9a-fA-F]{24}$/) || !storeid || !storeid.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: `productid:${productid}, storeid:${storeid}`
      });
    }

    if(token.role !== 'merchant'){ //check role
      return res.status(403).send({
        success: false,
        message: "forbidden",
        error: "only merchant can create product.",
      });
    }
    let store = await storeSchema.findById(storeid);
    if(store.owner_id !== token.id){ //check store owner
      return res.status(403).send({
        success: false,
        message: "forbidden",
        error: "merchant not an owner of store.",
      });
    }
    let product = await productSchema.findById(productid);
    if (!product) { //check product exist
      return res.status(404).send({
        success: false,
        message: "product not found.",
        error: `id:${id}`,
      });
    }
    await productSchema.findByIdAndDelete(productid); //find and delete product
    return res.status(200).send({ //delete success
      success: true,
      message: "delete success.",
    });
  } catch (error) {
    return res.status(500).send({ //error handling
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

module.exports = router;
