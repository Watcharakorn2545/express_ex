const express = require("express");
const router = express.Router();
const productSchema = require("../models/product.model");
const verifyToken = require("../middleware/token.middleware");
const storeSchema = require("../models/store.model");
const userSchema  = require("../models/user.model");

/* GET products listing. */
router.get("/possession/:ownerid",verifyToken, async function (req, res, next) { //get all stores
  try {
      let token = req.user;
      let {ownerid} = req.params;
    if(token.role !== 'merchant' || token.id !== ownerid){ //check role and owner
    return res.status(403).send({
        success: false,
        message: "forbidden",
        error: "only merchant see stores.",
      });
    }
    let stores = await storeSchema.find({owner_id:ownerid});
    return res.status(200).send({ //get success
      success: true,
      message: "get success.",
      data: stores,
    });
  } catch (error) {
    return res.status(500).send({ //error handling
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.get("/name", async function (req, res, next) { // search stores by name
  try {
    let { storename } = req.query;
    let stores = await storeSchema.find({ //search by store name and owner name
      $or: [
        { store_name: { $regex: storename, $options: "i" } },
        { owner_name: { $regex: storename, $options: "i" } }
      ],
    });
    if (!stores) { //check empty result
      return res.status(200).send({
        success: true,
        message: `stores name:${storename} not match.`,
        data: [],
      });
    }
    return res.status(200).send({//get success
      success: true,
      message: "get success.",
      data: stores,
    });
  } catch (error) {
    return res.status(500).send({//error handling
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});

router.post("/new/:ownerid",verifyToken, async function (req, res, next) { //create new store ;merchant only
    try {
      let token = req.user;
      let {ownerid} = req.params;
      
      // Move ID validation to top of try block
      if (!ownerid || !ownerid.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).send({
          success: false,
          message: "Invalid ID format",
          error: `id:${ownerid}`
        });
      }

      if(token.role !== 'merchant'){ //check role
        return res.status(403).send({
          success: false,
          message: "forbidden",
          error: "only merchant can create store.",
        });
      }
      console.log('ownerId==>',ownerid);
      let owner = await userSchema.findById(ownerid);
      if(!owner){ //check owner exist
        return res.status(404).send({
          success: false,
          message: "merchant not found.",
          error: `merchant id:${ownerid} not found.`,
        });
      }
      let { store_name, description, phone, address } = req.body;
      let store = new storeSchema({ //create new product
        store_name: store_name,
        owner_id: ownerid,
        owner_name: owner.firstname,
        description: description,
        phone: phone,
        address: address,
      });
      await store.save(); //save new product
      return res.status(201).send({ //create success
        success: true,
        message: "create success.",
        data: store,
      });
    } catch (error) { //error handling
      if (error.name === 'CastError') {
        return res.status(400).send({
          success: false,
          message: "Invalid ID format",
          error: error.message
        });
      }
      return res.status(500).send({
        success: false,
        message: "internal sever error.",
        error: error,
      });
    }
  }
);

router.put("/update", verifyToken, async function (req, res, next) {
  try {
    let token = req.user;
    let {ownerid, storeid} = req.query;

    // Add ID format validation for both IDs
    if (!ownerid || !ownerid.match(/^[0-9a-fA-F]{24}$/) || !storeid || !storeid.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: `ownerid:${ownerid}, storeid:${storeid}`
      });
    }

    if(token.role !== 'merchant' || token.id !== ownerid){
      return res.status(403).send({
        success: false,
        message: "forbidden",
        error: "only merchant can update store.",
      });
    }

    let store = await storeSchema.findById(storeid);
    if(!store){ //check store exist
      return res.status(404).send({
        success: false,
        message: "store not found.",
        error: `store id:${storeid} not found.`,
      });
    }
    if(store.owner_id !== ownerid){ //check store owner
      return res.status(403).send({
        success: false,
        message: "forbidden",
        error: "merchant not an owner of store.",
      });
    }
    let { store_name, description, phone, address } = req.body;
    let owner = await userSchema.findById(ownerid);
    if(!owner){ //check owner exist
      return res.status(404).send({
        success: false,
        message: "merchant not found.",
        error: `merchant id:${ownerid} not found.`,
      });
    }
    let owner_name = owner.firstname;
    let updateStore = await storeSchema.findByIdAndUpdate( //find and update product
      storeid,
      { store_name:store_name,owner_name:owner_name, description:description, phone:phone,address:address },
      { new: true }
    );
    return res.status(201).send({ //update success
      success: true,
      message: "update success.",
      data: updateStore,
    });
  } catch (error) {
    return res.status(500).send({ //error handling
      success: false,
      message: "internal sever error.",
      error: error,
    });
  }
});
router.delete("/remove",verifyToken, async function (req, res, next) {
  try {
    let token = req.user;
    let {ownerid, storeid} = req.query;

    // Add ID format validation for both IDs
    if (!ownerid || !ownerid.match(/^[0-9a-fA-F]{24}$/) || !storeid || !storeid.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format",
        error: `ownerid:${ownerid}, storeid:${storeid}`
      });
    }

    if(token.role !== 'merchant' || token.id !== ownerid){
      return res.status(403).send({
        success: false,
        message: "forbidden",
        error: "only merchant can create product.",
      });
    }
    let owner = await userSchema.findById(ownerid);
    if(!owner){ //check owner exist
      return res.status(404).send({
        success: false,
        message: "merchant not found.",
        error: `merchant id:${ownerid} not found.`,
      });
    }
    let store = await storeSchema.findById(storeid);
    if (!store) { //check store exist
      return res.status(404).send({
        success: false,
        message: "store not found.",
        error: `id:${storeid}`,
      });
    }
      if(store.owner_id !== ownerid){ //check store owner
        return res.status(403).send({
          success: false,
          message: "forbidden",
          error: "merchant not an owner of store.",
        });
      }
    await storeSchema.findByIdAndDelete(storeid); //find and delete product
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
