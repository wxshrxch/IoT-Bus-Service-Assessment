const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { ensureAuthenticated, forwardAuthenticated } = require('./auth')
const {spawn} = require('child_process');
const iconv = require('iconv-lite');
const Document = require('../models/document')
const User = require('../models/user')
const Comment =require('../models/comment')
const Mpu = require('../models/mpu6050')
const Bus1 = require('../models/bus')
const url = require('url')




//changing
//router.get('/dash', (req, res) => {
router.get('/home', (req, res) => {
    res.redirect('/dashboard')
})



// router.post('/register',(req, res)=>{
//     User.findById({_id : req.user}, (err, user)=>{

//         const user_id = 'client';
//         const busnum = req.body.busnum;
//         const title = req.body.title;
//         const main = req.body.main;

//         const newDocument = new Document({
//            user_id, title, main, busnum
          
//         })
        
//         newDocument.save()
//         .then(() => {
//             //changing
//             res.redirect('/dashboard')
//             //res.redirect('/dash')
//         })
//         .catch(err => console.log(err))
//     })

    
// })
router.post('/register',(req, res)=>{
    User.findById({_id : req.user}, (err, user)=>{

        const user_id = user.id;
        const busnum = req.body.busnum;
        const title = req.body.title;
        const main = req.body.main;
        const newDocument = new Document({
           user_id, title, main, busnum
        })
        const childPython = spawn('python',['./pytorch-sentiment-analysis-kor-master/predict.py','--model','vanilla_rnn','--input',main]);
        //const childPython = spawn('C:/ProgramData/Anaconda3/Scripts/activate',['&&','conda activate pytorch-sentiment-analysis-kor-master','&&','cd','./pytorch-sentiment-analysis-kor-master','&&','python','predict.py','--model','vanilla_rnn','--input',main],{shell: process.platform == 'win32'});
        var rnn1_1={}
        var rnn1_1={}
        var cnn1_1={}
        var cnn1_1 ={}
        var lstm1_1={}
        var lstm1_1 ={}
        var rnn_pos=0
        var rnn_nega=0
        var cnn_pos=0
        var cnn_nega=0
        var lstm_pos=0
        var lstm_nega=0
        var posAvg=0
        var negAvg=0
        
        childPython.stdout.on('data', (data) =>{
            const strArray = data.toString().split(" ");
     
            //Document.updateOne({_id : newDocument._id}, 
                //{$set:{rnn_percent : strArray[0],rnn_label : strArray[1]}},(err)=>{});
            console.log(`rnn_model: ${strArray[0]} ${strArray[1]}`)
            rnn1_1[parseFloat(strArray[0])]=strArray[1]
            if(Object.keys(rnn1_1)!=NaN &&Object.keys(cnn1_1)!=NaN&&Object.keys(lstm1_1)!=NaN ){
                for(var rnn_x in rnn1_1){
                    var rnn_a=rnn_x
                    var rnn_b=rnn1_1[rnn_a]
                    if(rnn_x>=50){
                        rnn_pos=rnn_x
                        rnn_nega = 100-rnn_x
                    }
                    else{
                        rnn_nega=100-rnn_x
                        rnn_pos = rnn_x
                    }}
        
                for(var cnn_x in cnn1_1){
                    var cnn_a=cnn_x
                    var cnn_b=cnn1_1[cnn_a]
                    if(cnn_x>=50){
                        cnn_pos=cnn_x
                        cnn_nega = 100-cnn_x
                    }
                    else{
                        cnn_nega=100-cnn_x
                        cnn_pos = cnn_x
                        }}
                for(var lstm_x in lstm1_1){
                    var lstm_a=lstm_x
                    var lstm_b=lstm1_1[lstm_a]
                    if(lstm_x>=50){
                        lstm_pos=lstm_x
                        lstm_nega = 100-lstm_x
                    }
                    else{
                        lstm_nega=100-lstm_x
                        lstm_pos = lstm_x
                        }}
        
                //posAvg = (rnn_pos+cnn_pos+lstm_pos)/3
                posAvg = (rnn_pos*0.3+cnn_pos*0.2+lstm_pos*0.5)
                negAvg = (rnn_nega*0.3+cnn_nega*0.+lstm_nega*0.5)
                if (posAvg>negAvg){
                    Document.updateOne({_id : newDocument._id}, 
                        {$set:{label : "Positive\r\n"}},(err)=>{});
                     //db에 pos 저장
                 }
                 else{
                        Document.updateOne({_id : newDocument._id}, 
                            {$set:{label : "Negative\r\n"}},(err)=>{});

                     //db에 negative 저장
                 }
            }
        })

        childPython.stderr.on('data', (data) =>{
            console.error(`stderr: ${data}`);
        });
        childPython.on('close', (code) =>{
            console.log(`child process exited with code ${code}`);
        });
        const childPython2 = spawn('python',['./pytorch-sentiment-analysis-kor-master/predict.py','--model','cnn','--input',main,'--save_model','./pytorch-sentiment-analysis-kor-master/cnn_model.pt']);
        //const childPython2 = spawn('C:/ProgramData/Anaconda3/Scripts/activate',['&&','conda activate pytorch-sentiment-analysis-kor-master','&&','cd','C:/Users/SeungMin/Desktop/finalterm/pytorch-sentiment-analysis-kor-master','&&','python','predict.py','--model','cnn','--input',main,'--save_model','cnn_model.pt'],{shell: process.platform == 'win32'});
        childPython2.stdout.on('data', (data) =>{
            const strArray = data.toString().split(" ");
           // Document.updateOne({_id : newDocument._id}, 
                //{$set:{cnn_percent : strArray[0],cnn_label : strArray[1]}},(err)=>{});
            console.log(`cnn_model: ${strArray[0]} ${strArray[1]}`)
            cnn1_1[parseFloat(strArray[0])]=strArray[1]
            if(Object.keys(rnn1_1)!=NaN &&Object.keys(cnn1_1)!=NaN&&Object.keys(lstm1_1)!=NaN ){
                for(var rnn_x in rnn1_1){
                    var rnn_a=rnn_x
                    var rnn_b=rnn1_1[rnn_a]
                    if(rnn_x>=50){
                        rnn_pos=rnn_x
                        rnn_nega = 100-rnn_x
                    }
                    else{
                        rnn_nega=100-rnn_x
                        rnn_pos = rnn_x
                    }}
        
                for(var cnn_x in cnn1_1){
                    var cnn_a=cnn_x
                    var cnn_b=cnn1_1[cnn_a]
                    if(cnn_x>=50){
                        cnn_pos=cnn_x
                        cnn_nega = 100-cnn_x
                    }
                    else{
                        cnn_nega=100-cnn_x
                        cnn_pos = cnn_x
                        }}
                for(var lstm_x in lstm1_1){
                    var lstm_a=lstm_x
                    var lstm_b=lstm1_1[lstm_a]
                    if(lstm_x>=50){
                        lstm_pos=lstm_x
                        lstm_nega = 100-lstm_x
                    }
                    else{
                        lstm_nega= 100-lstm_x
                        lstm_pos = lstm_x
                        }}
                posAvg = (rnn_pos*0.3+cnn_pos*0.2+lstm_pos*0.5)
                negAvg = (rnn_nega*0.3+cnn_nega*0.2+lstm_nega*0.5)
                if (posAvg>negAvg){
                    Document.updateOne({_id : newDocument._id}, 
                        {$set:{label : "Positive\r\n"}},(err)=>{});
                             //db에 pos 저장
                }
                else{
                    Document.updateOne({_id : newDocument._id}, 
                        {$set:{label : "Negative\r\n"}},(err)=>{});
                             //db에 negative 저장
                }
            }
        })
        childPython2.stderr.on('data', (data) =>{
            console.error(`stderr: ${data}`);
        });
        childPython2.on('close', (code) =>{
            console.log(`child2 process exited with code ${code}`);
        });

        const childPython3 = spawn('python',['./pytorch-sentiment-analysis-kor-master/predict.py','--model','bidirectional_lstm','--input',main,'--save_model','./pytorch-sentiment-analysis-kor-master/lstm_model.pt']);
        //const childPython3 = spawn('C:/ProgramData/Anaconda3/Scripts/activate',['&&','conda activate pytorch-sentiment-analysis-kor-master','&&','cd','C:/Users/SeungMin/Desktop/finalterm/pytorch-sentiment-analysis-kor-master','&&','python','predict.py','--model','bidirectional_lstm','--input',main,'--save_model','lstm_model.pt'],{shell: process.platform == 'win32'});
        childPython3.stdout.on('data', (data) =>{
            const strArray = data.toString().split(" ");
            console.log(`lstm_model: ${strArray[0]} ${strArray[1]}`)
            lstm1_1[parseFloat(strArray[0])]=strArray[1]
            if(Object.keys(rnn1_1)!=NaN &&Object.keys(cnn1_1)!=NaN&&Object.keys(lstm1_1)!=NaN ){
                for(var rnn_x in rnn1_1){
                    var rnn_a=rnn_x
                    var rnn_b=rnn1_1[rnn_a]
                    if(rnn_x>=50){
                        rnn_pos=rnn_x
                        rnn_nega = 100-rnn_x
                    }
                    else{
                        rnn_nega= 100-rnn_x
                        rnn_pos = rnn_x
                    }}
        
                for(var cnn_x in cnn1_1){
                    var cnn_a=cnn_x
                    var cnn_b=cnn1_1[cnn_a]
                    if(cnn_x>=50){
                        cnn_pos=cnn_x
                        cnn_nega = 100-cnn_x
                    }
                    else{
                        cnn_nega= 100-cnn_x
                        cnn_pos = cnn_x
                        }}
                for(var lstm_x in lstm1_1){
                    var lstm_a=lstm_x
                    var lstm_b=lstm1_1[lstm_a]
                    if(lstm_x>=50){
                        lstm_pos=lstm_x
                        lstm_nega = 100-lstm_x
                    }
                    else{
                        lstm_nega= 100-lstm_x
                        lstm_pos = lstm_x
                        }}
        
                posAvg = (rnn_pos*0.3+cnn_pos*0.2+lstm_pos*0.5)
                negAvg = (rnn_nega*0.3+cnn_nega*0.2+lstm_nega*0.5)
                if (posAvg>negAvg){
                    Document.updateOne({_id : newDocument._id}, 
                        {$set:{label : "Positive\r\n"}},(err)=>{});
                     //db에 pos 저장
                 }
                 else{
                        Document.updateOne({_id : newDocument._id}, 
                            {$set:{label : "Negative\r\n"}},(err)=>{});

                     //db에 negative 저장
                 }
            }
        })
        childPython3.stderr.on('data', (data) =>{
            console.error(`stderr: ${data}`);
        });
        childPython3.on('close', (code) =>{
            console.log(`child3 process exited with code ${code}`);
        });
        
     

        

        newDocument.save()
        .then(() => {
            //changing
            //res.redirect('/dashboard')
            res.redirect('/post_star')
        })
        .catch(err => console.log(err))
    })

    
})
router.get('/edit', ensureAuthenticated, (req, res)=>{
    User.findById({_id : req.user}, (err, user)=>{
        Bus1.find((err,doc1)=>{
            let name = null;
            if(user){
                name = user.name;
            }
            post_id = req.query.post_id;

            Document.findById({_id: post_id}, (err,doc)=>{
            //res.render('postEdit',{name: name, title: doc.title, main: doc.main, post_id: post_id, busnum: doc.busnum})
                res.render('postEdit',{name: name, main: doc.main, post_id: post_id, busnum: doc.busnum,doc1: doc1})
        })
    })
        
    })
})

router.post('/edit', (req, res)=>{
    const newComments = [];
    let idCount = 0;

    User.findById({_id : req.user}, (err, user)=>{
        let name = null;
        if(user){
            name = user.name;
        }

        const post_id = req.body.post_id;
        const title = req.body.title;
        const main = req.body.main
        const busnum = req.body.busnum;

        

        Document.updateOne({_id : post_id}, 
            {$set:{ title : title,
                main : main}},(err)=>{});
        
        Document.findById({_id: post_id}, (err, post)=>{
            Comment.find((err,comments)=>{
                for(let i = 0; i < comments.length; ++i){
                    if(comments[i].post_id == post_id){
                   

                        if(comments[i].user_id == user.id){
                            comments[i] = Object.assign(comments[i], {myComment: true}); 
                        }
                        User.findById({_id: comments[i].user_id},  (err, cuser)=>{
                            comments[i] = Object.assign(comments[i], {nickname: cuser.nickname});
                            ++idCount;
                        })
                    newComments.push(comments[i]);
                    } 
                }

            let interval = null;
            const check = ()=>{
                interval = setInterval(()=>{
                    if(idCount == newComments.length){
                        res.render('postView', {
                            name : name,
                            title : post.title,
                            main: post.main,
                            post_id: post.id,
                            comments: newComments,
                            busnum: post.busnum,
                        });
                        clearInterval(interval);
                    }
                },100)
            }
            check();
        }) 
        })
    })
})





router.get('/delete', (req, res)=>{
    const post_id = req.query.post_id;

    Document.deleteOne({_id: post_id},(err)=>{
        
    })
    const run = async ()=>{
        const result = await Comment.deleteMany({post_id: post_id}).exec()
        console.log(result);
    }
    run();
    //changing
    res.send('<script type="text/javascript">window.location = document.referrer; </script>');
    //res.redirect('/dashboard');

})


router.post('/comment', (req, res)=>{

    User.findById({_id : req.user}, (err, user)=>{
        const user_id = user.id;
        const post_id = req.body.post_id;
        const comment = req.body.comment;

        const newComment = new Comment({
           user_id, post_id, comment
        })
        
        newComment.save()
        .then(() => {
            res.redirect('/post/view?post_id='+post_id);
        })
        .catch(err => console.log(err))
    })
})

router.get('/comment/delete', (req, res)=>{
    const comment_id = req.query.comment_id;
    const post_id = req.query.post_id;

    console.log(comment_id);
    console.log(post_id);

    Comment.deleteOne({_id: comment_id},(err)=>{
        
    })

    res.redirect('/post/view?post_id='+post_id);
})


router.get('/view', async (req, res)=>{
    const newComments = [];
    let idCount = 0;
    const busnum = req.body.busnum;
    
    

    User.findById({_id : req.user}, (err, user)=>{
        let name = null;
        if(user){
            name = user.name;
        }
        const post_id = req.query.post_id;
        Document.findById({_id: post_id}, (err, post)=>{
            
            Comment.find((err,comments)=>{
                    for(let i = 0; i < comments.length; ++i){
                        if(comments[i].post_id == post_id){
                       

                            if(comments[i].user_id == user.id){
                                comments[i] = Object.assign(comments[i], {myComment: true}); 
                            }
                            User.findById({_id: comments[i].user_id},  (err, cuser)=>{
                                comments[i] = Object.assign(comments[i], {nickname: cuser.nickname});
                                ++idCount;
                            })
                        newComments.push(comments[i]);
                        } 
                    }

                let interval = null;
                const check = ()=>{
                    interval = setInterval(()=>{
                        if(idCount == newComments.length){
                            res.render('postView', {
                                name : name,
                                title : post.title,
                                main: post.main,
                                post_id: post.id,
                                comments: newComments,
                                busnum: post.busnum,
                            });
                            clearInterval(interval);
                        }
                    },100)
                }
                check();
            })   
        })
        
    })



})

router.get('/', ensureAuthenticated ,(req, res)=>{
  const _url = req.url;
  const queryData = url.parse(_url,true).query;
  console.log(_url);
  console.log(queryData);
  User.findById({_id : req.user}, (err, user)=>{
      Bus1.find((err,doc1)=>{
          let name = null;
          if(user){
              name = user.name;
          }
          
      res.render('post', {
          name : name,
          doc1: doc1,
          num :queryData.busNum,
      })
     
    
  })
})
})

module.exports = router