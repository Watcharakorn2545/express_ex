const mongoose = require('mongoose')
const {Schema} = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const orderSchema = new Schema({
    order_id: {type: Number,unique:true,require:true,dropDups:true},
    buyer_name:{type: String,},
    products: {type: Array, default: []},
    total_price: {type: Number,},
},{
    timestamps: true,
})
orderSchema.plugin(AutoIncrement, { id: "order_id", inc_field: "order_id" })

module.exports = mongoose.model("orders", orderSchema)