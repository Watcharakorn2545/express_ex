const mongoose = require('mongoose')
const {Schema} = mongoose;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new Schema({
    user_id: {type: Number,unique:true,require:true,dropDups:true},
    username:{type: String,unique:true,require:true,dropDups:true},
    password: {type: String,},
    firstname: {type: String},
    lastname: {type: String},
    age: {type: Number},
    sex: {type: String}
},{
    timestamps: true,
})
userSchema.plugin(AutoIncrement, { id: "user_id", inc_field: "user_id" })

module.exports = mongoose.model("users", userSchema)