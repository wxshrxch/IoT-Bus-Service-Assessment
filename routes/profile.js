const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { ensureAuthenticated } = require('./auth')

// Use Models
const User = require('../models/user') 

// Login page
router.get('/', ensureAuthenticated, (req, res) => {

    User.findById(req.user, (err, user)=>{
        res.render('profile', {
            name: user.name,
            email: user.email,
            nickname: user.nickname,
            introduce: user.introduce,
            date: user.date,
        })
    })

})

router.get('/profileEdit', ensureAuthenticated,(req, res)=>{

    User.findById(req.user, (err, user)=>{
        res.render('profileEdit', {
            name: user.name,
            email: user.email,
            nickname: user.nickname,
            introduce: user.introduce,
            date: user.date,
        })
    })
    
})

router.post('/edit', (req, res)=>{
    User.findById(req.user, (err, user)=>{
        //update introduce
        if(user.nickname == req.body.nickname){
            User.updateOne({_id : user.id}, {$set: {introduce : req.body.introduce}}, (err)=>{});
            res.render('profile', {
                name: user.name,
                email: user.email,
                nickname: user.nickname,
                introduce: req.body.introduce,
                date: user.date,
            })
        }
        //update nickname & introduce
        else{
            User.findOne({nickname: req.body.nickname})
                .then( user=>{
                    //중복되는 닉네임 존재
                    if(user){
                        //introduce만 변경
                        User.updateOne({_id : req.user}, {$set: {introduce : req.body.introduce}},(err)=>{});
                    }
                    //중복 닉네임 없음
                    else{
                        User.updateOne({_id : req.user}, 
                            {$set:{ nickname : req.body.nickname,
                                introduce : req.body.introduce}},(err)=>{});
                    }  
                    User.findById(req.user, (err, user)=>{
                        res.render('profile', {
                        name: user.name,
                        email: user.email,
                        nickname: user.nickname,
                        introduce: user.introduce,
                        date: user.date,
                        })
                    })            
            }) 
        }
    })

    
    
})

module.exports = router