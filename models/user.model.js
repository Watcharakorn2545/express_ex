const mongoose = require('mongoose')
const {Schema} = mongoose;

const userSchema = new Schema({
    username:{type: String,unique:true,require:true,dropDups:true},
    password: {type: String,require:true},
    firstname: {type: String,require:true},
    lastname: {type: String,require:true},
    role: {type: String,require:true,default: 'customer'},//customer,admin,merchant
    age: {type: Number,require:true,default: 0},
    sex: {type: String,require:true,default: 'other'},//male,female,other
    email:{type: String,require:true,default: ''},
    phone: {type: String,require:true,default: ''},
},{
    timestamps: true,
})

module.exports = mongoose.model("users", userSchema)