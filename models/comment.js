const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    user_id: {
        type: String,
    },
    post_id:{
        type: String,
    },
    comment: {
        type: String,
    }
})

module.exports = mongoose.model('Comment', CommentSchema)