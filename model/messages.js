const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    message:{type:String, required:true},
    username:{type:String, required:true},
    topic:{type:String, required:true},
    createdTime:{type:Number}
})

module.exports = mongoose.model('Message', MessageSchema)