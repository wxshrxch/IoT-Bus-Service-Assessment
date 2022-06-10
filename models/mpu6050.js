/*
const mongoose = require('mongoose')

const Mpu6050Schema = new mongoose.Schema({
 //   _id: {
 //       type: String,
 //   },
    AcX: {
        type: String,
    },
    AcY: {
        type: String,
    },
    AcZ: {
        type: String,
    },
    GyX: {
        type: String,
    },
    GyY: {
        type: String,
    },
    GyZ: {
        type: String,
    }
})

module.exports = mongoose.model('Mpu6050', Mpu6050Schema)
*/
const mongoose = require('mongoose')

const Mpu6050Schema = new mongoose.Schema({
    angleFiY: {
        type: String,
    },
    label: {
        type: String,
    },
    busNum:{
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Mpu6050', Mpu6050Schema)