const mongoose = require('mongoose')
const {Schema} = mongoose;


const orderSchema = new Schema({
    customer_id:{type: String,require:true},
    customer_name:{type: String,require:true},
    storeObj:{type: Object,require:true},
    products: {type: Array, default: []},
    total_price: {type: Number,require:true},
},{
    timestamps: true,
})


module.exports = mongoose.model("orders", orderSchema)