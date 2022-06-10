const mongoose = require('mongoose')

const Bus1Schema = new mongoose.Schema({
    ROUTE_ID: {  
        type: String,
    },
    노선명: {
        type:String,
    },
})

module.exports  = mongoose.model('Bus1', Bus1Schema)