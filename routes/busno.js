const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const passport = require('passport')
const { forwardAuthenticated } = require('./auth')

// Use Models
const User = require('../models/user') 
const db = "mongodb://localhost:27017/usersDB"
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true})
// Register page


// Router page in post


module.exports = router