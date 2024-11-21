const mongoose = require('mongoose')
const {Schema} = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const productSchema = new Schema({
    product_id: {type: Number,},
    name:{type: String,},
    detail: {type: String,},
    price: {type: Number},
    remain: {type: Number,},
},{
    timestamps: true,
})

productSchema.plugin(AutoIncrement, { id: "product_id", inc_field: "product_id" })


module.exports = mongoose.model("products", productSchema)