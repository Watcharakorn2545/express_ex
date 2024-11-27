const mongoose = require('mongoose')
const {Schema} = mongoose;

const productSchema = new Schema({
    product_name:{type: String,require:true},
    store_id:{type: String,require:true},
    categories:{type:String,require:true,default:''},
    description: {type: String,require:true,default: ''},
    price: {type: Number,require:true,default: 0},
    stock: {type: Number,require:true,default: 0},
},{
    timestamps: true,
})


module.exports = mongoose.model("products", productSchema)