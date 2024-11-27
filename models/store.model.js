const mongoose = require('mongoose')
const {Schema} = mongoose;

const storeSchema = new Schema({
    store_name:{type: String,require:true},
    owner_id:{type: String,require:true},
    owner_name:{type: String,require:true},
    description: {type: String,require:true,default: ''},
    phone: {type: String,require:true,default: ''},
    address: {type: String,require:true,default: ''},
    status: {type: String,require:true,default: 'close'},//open,close
},{
    timestamps: true,
})


module.exports = mongoose.model("stores", storeSchema)