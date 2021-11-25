const mongoose = require('mongoose');

const useSchema = mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    password: String,
    role : String
})

mongoose.model('User', useSchema)

module.exports = mongoose.model('User')