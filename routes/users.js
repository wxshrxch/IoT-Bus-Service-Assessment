const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const url = require('url')
const mongoose = require('mongoose')
const passport = require('passport')
const { forwardAuthenticated } = require('./auth')
const { forwardAuthenticated2 } = require('./auth2')
// Use Models
const User = require('../models/user') 
const db = "mongodb://localhost:27017/usersDB"
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true})
   


// Login page
//router.get('/login', forwardAuthenticated, (req, res) => {
router.get('/', forwardAuthenticated, (req, res) => {
    //res.render('login')
    res.render('home')
})
// Login page
router.get('/login2', forwardAuthenticated2, (req, res) => {
    const _url = req.url;
    const q2 = url.parse(_url,true).query;
    console.log(q2.id)
    res.render('login2',{q2:q2.id})
})
// Login handle
//router.post('/login', (req, res, next) => {
router.post('/home', (req, res, next) => {
    passport.authenticate('local', {
        //changing
        successRedirect: '/dashboard',
        //successRedirect: '/dash',
        //successRedirect: '/home',
        //failureRedirect: '/users/login',
        //또잉
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next)
})
// Login handle
router.post('/login2', (req, res, next) => {
    const _url = req.url;
    const q2 = url.parse(_url,true).query;
    console.log(q2.id)
    passport.authenticate('local', {
        successRedirect: '/busno?id='+q2.id,
        failureRedirect: '/users/login2',
        failureFlash: true
    })(req, res, next)
})
// Register page
router.get('/register', forwardAuthenticated, (req, res) => {
    res.render('register')
})

// Router page in post
router.post('/register', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const nickname = req.body.nickname;
    const introduce = req.body.introduce;
    let errors = []

    // Check password's length
    if (password.length < 4) {
        errors.push({ msg: 'Password should be at least 4 characters' })
    }
    // Error messages
    if (errors.length > 0) {
        res.render('register', {
            errors, 
            name, email, password, nickname, introduce
        })
    } 
    else {
        User.findOne({nickname: nickname})
            .then(user=>{
                if(user){
                    errors.push({ msg: 'nickname is already registered'})
                    res.render('register', {
                        errors,
                        name, email, password, nickname, introduce
                    })
                }
            })
            .then(() =>{
                // Validation passed
                User.findOne({email: email})
                .then(user => {
                    if(user) {
                        //User exists
                        errors.push({ msg: 'Email is already registered'})
                        res.render('register', {
                            errors,
                            name, email, password, nickname, introduce
                        })
                    } 
                    else {
                        const newUser = new User({
                            name, email, password, nickname, introduce
                        })
                        // Hash Password
                        bcrypt.hash(newUser.password, 10, (err,hash) => {
                            if(err) throw err;
                            newUser.password = hash
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', '회원가입 되셨습니다.')
                                    //res.redirect('/users/login')
                                    //또잉
                                    res.redirect('/')
                                })
                                .catch(err => console.log(err))
                        })         
                    }
                 })
            })
        
}})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', '로그아웃 하셨습니다.')

    //res.redirect('/users/login')
    //또잉
    res.redirect('/')
})

  
  


module.exports = router