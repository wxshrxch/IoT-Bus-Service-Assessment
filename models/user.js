const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    nickname: {
        type: String,
    },
    introduce: {
        type: String,
    },
    
})

module.exports = mongoose.model('User', UserSchema)