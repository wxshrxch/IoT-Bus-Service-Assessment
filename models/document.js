const mongoose = require('mongoose')
//var moment=require('moment')
const DocumentSchema = new mongoose.Schema({
    busnum: {
        type: String,
    },
    user_id: {
        type: String,
    },
    main: {
        type: String,
    },
    
    //rnn_percent: {
        //type: String,
        //default: 'null'
    //},
    //rnn_label: {
        //type: String,
        //default: 'null'
    //},
    //cnn_percent: {
        //type: String,
        //default: 'null'
    //},
    //cnn_label: {
        //type: String,
        //default: 'null'
    //},
    //lstm_percent: {
        //type: String,
        //default: 'null'
    //},
    //lstm_label: {
        //type: String,
        //default: 'null'
    //}
    label: {
        type: String,
        default: 'null'
    },
    date: {
        type: Date,
        default: new Date()
        //default: Date.now() + 3*60*1000
        //default:moment().format('YYYY-MM-DD HH:mm:ss')
    },
})

module.exports = mongoose.model('Document', DocumentSchema)