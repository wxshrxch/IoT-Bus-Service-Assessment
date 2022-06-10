const express = require('express')
const router = express.Router()
const { ensureAuthenticated, forwardAuthenticated } = require('./auth')
const {ensureAuthenticated2} = require('./auth2')
const User = require('../models/user')
const Document = require ('../models/document')
const Mpu = require('../models/mpu6050')
const Bus1 = require('../models/bus')
const url = require('url')
const mongoose = require('mongoose')
const querystring  = require('querystring');
const urlSearchParams = url.searchParams
//var moment=require('moment')

router.get('/', forwardAuthenticated, (req, res) => {
  Document.find((err,docs)=>{
    //changing
    //res.render('index', {
    res.render('home', {
      docs: docs,
    })
  })
})

router.get('/home', ensureAuthenticated, (req, res) => {
  User.findById(req.user, (err, user) => {
    Document.find((err,docs)=>{
      for(let i = 0; i < docs.length; ++i){
        if(req.user == docs[i].user_id){
          Object.assign(docs[i], {myPost: true})
        }
      }
      res.render('home', {
        name: user.name,
        docs: docs,
        busnum: user.busnum,
      })
    })
  })
})


router.get('/home', ensureAuthenticated, (req, res) => {
  User.findById(req.user, (err, user) => {
    Document.find((err,docs)=>{
      for(let i = 0; i < docs.length; ++i){
        if(req.user == docs[i].user_id){
          Object.assign(docs[i], {myPost: true})
        }
      }
      res.render('home', {
        name: user.name,
        docs: docs,
        busnum: user.busnum,
      })
    })
  })
})

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  User.findById(req.user, (err, user) => {
    Document.find((err,docs)=>{
      Bus1.find((err,doc1)=>{
        for(let i = 0; i < docs.length; ++i){
          if(req.user == docs[i].user_id){
            Object.assign(docs[i], {myPost: true})
            }
          }
        var inform = {
        }
        var same_rank1 = {
        }
        var same_rank2 = {
        }
        var same_rank3 = {
        }
        var same_rank4 = {
        }
        var same_rank5 = {
        }

      Mpu.find((err,doc11)=>{
        //버스 목록 개수 만큼 반복
        for(k=0;k<doc1.length;k++){
          var count = 0;
          var bus_name = doc1[k].노선명
          //mpu 개수 만큼 반복
          for(n =0; n<doc11.length;n++){
            var bus_name_2 = doc11[n].busNum
            //버스 번호 동일 시
            if(bus_name == bus_name_2){
              //카운트
              count+=1
            }
          }
          if(count!=0){
          //해당 버스 번호에 카운트 저장
          inform[bus_name] = count
          }
      }
      var inform_sum={}
      for(var x in inform){
        var before_sum=0
        var after_sum=0
        var sum_count=0
        var mpu_da1=0
        var mpu_da2=0
        var mpu_da3=0
        var mpu_da4=0
        var mpu_da5=0
        for(c =0; c<doc11.length;c++){
          if(x==doc11[c].busNum){
            if(mpu_da1==0){
              mpu_da1=doc11[c].angleFiY
              mpu_da1=parseFloat(mpu_da1)
              mpu_da1=Math.abs(mpu_da1)
            }
            else if(mpu_da2==0){
              mpu_da2=doc11[c].angleFiY
              mpu_da2=parseFloat(mpu_da2)
              mpu_da2=Math.abs(mpu_da2)
            }
            else if(mpu_da3==0){
              mpu_da3=doc11[c].angleFiY
              mpu_da3=parseFloat(mpu_da3)
              mpu_da3=Math.abs(mpu_da3)
            }
            else if(mpu_da4==0){
              mpu_da4=doc11[c].angleFiY
              mpu_da4=parseFloat(mpu_da4)
              mpu_da4=Math.abs(mpu_da4)
            }
            else if(mpu_da5==0){
              mpu_da5=doc11[c].angleFiY
              mpu_da5=parseFloat(mpu_da5)
              mpu_da5=Math.abs(mpu_da5)
            }
          }
          //------------------------------우선 교수님이 알려주신 공식대로 mpu 급정거 카운트 방법 바꿈--------------------- 
          if(mpu_da1!=0&&mpu_da2!=0&&mpu_da3!=0&&mpu_da4!=0&&mpu_da5!=0){
            before_sum=((mpu_da1+mpu_da2)/2)*4.6
            after_sum=(mpu_da3+mpu_da4+mpu_da5)/3

            if(before_sum<after_sum){
              sum_count+=1
            }
            mpu_da1=mpu_da2
            mpu_da2=mpu_da3
            mpu_da3=mpu_da4
            mpu_da4=mpu_da5
            mpu_da5=0
          }
        }
        inform_sum[x]=sum_count
      }
      var mpu_star = {}
      for(var x in inform){
        var mpu_rank_all = (inform[x]-inform_sum[x])/doc11.length
        mpu_star[x]=mpu_rank_all*100
      }


      let mpusort = [];
      for (let mpu_number in mpu_star) {
        mpusort.push([mpu_number, mpu_star[mpu_number]]);
      }
      mpusort.sort(function(a, b) {
        return a[1] - b[1];
      });

      let mpu_sort_count=0
      if(mpu_sort_count<mpusort.length){
      for(var f=0;f<mpusort.length;f++){
        if(f==0){
          mpu_sort_count+=1
        same_rank1[mpusort[0][0]] = mpusort[0][1]
        }
        else if(mpusort[0][1]==mpusort[f][1]){
          mpu_sort_count+=1
          same_rank1[mpusort[f][0]] = mpusort[f][1]      
        }
      }
      mpu_count1=mpusort[mpu_sort_count-1][1]
      mpu_count1=100-mpu_count1
      mpu_count1=String(mpu_count1)
      mpu_count1='width:'+mpu_count1+'%;'
    }
      else{
        mpu_count1='a'
      }
      let mpu_sort_count2=mpu_sort_count
      if(mpu_sort_count2<mpusort.length){
      for(var f=mpu_sort_count;f<mpusort.length;f++){
        if(f==mpu_sort_count){
        same_rank2[mpusort[f][0]] = mpusort[f][1]
        mpu_sort_count2+=1
        }
        else if(mpusort[mpu_sort_count][1]==mpusort[f][1]){
          mpu_sort_count2+=1
          same_rank2[mpusort[f][0]] = mpusort[f][1]      
        }
      }

      mpu_count2=100-mpusort[mpu_sort_count][1]
      mpu_count2=String(mpu_count2)
      mpu_count2='width:'+mpu_count2+'%;'
    }
    else{
      mpu_count2='a'
    }
  
      let mpu_sort_count3=mpu_sort_count2
      if(mpu_sort_count3<mpusort.length){
      for(var f=mpu_sort_count2;f<mpusort.length;f++){
        if(f==mpu_sort_count2){
          mpu_sort_count3+=1
          same_rank3[mpusort[f][0]] = mpusort[f][1]
        }
        else if(mpusort[mpu_sort_count2][1]==mpusort[f][1]){
          mpu_sort_count3+=1
          same_rank3[mpusort[f][0]] = mpusort[f][1]      
        }
      }

      mpu_count3=100-mpusort[mpu_sort_count2][1]
      mpu_count3=String(mpu_count3)
      mpu_count3='width:'+mpu_count3+'%;'
    }
    else{
      mpu_count3='a'
    }
  
  
      let mpu_sort_count4=mpu_sort_count3
      if(mpu_sort_count4<mpusort.length){
      for(var f=mpu_sort_count3;f<mpusort.length;f++){
        if(f==mpu_sort_count3){
          mpu_sort_count4+=1
          same_rank4[mpusort[f][0]] = mpusort[f][1]
        }
        else if(mpusort[mpu_sort_count3][1]==mpusort[f][1]){
          mpu_sort_count4+=1
          same_rank4[mpusort[f][0]] = mpusort[f][1]      
        }
      }

      mpu_count4=100-mpusort[mpu_sort_count3][1]
      mpu_count4=String(mpu_count4)
      mpu_count4='width:'+mpu_count4+'%;'
    }
    else{
      mpu_count4='a'
    }
  
      let mpu_sort_count5=mpu_sort_count4
      if(mpu_sort_count5<mpusort.length){
      for(var f=mpu_sort_count4;f<mpusort.length;f++){
        if(f==mpu_sort_count4){
          mpu_sort_count5+=1
          same_rank5[mpusort[f][0]] = mpusort[f][1]
        }
        else if(mpusort[mpu_sort_count4][1]==mpusort[f][1]){
          mpu_sort_count5+=1
          same_rank5[mpusort[f][0]] = mpusort[f][1]      
        }
      }

      mpu_count5=100-mpusort[mpu_sort_count4][1]
      mpu_count5=String(mpu_count5)
      mpu_count5='width:'+mpu_count5+'%;'
    }
    else{
      mpu_count5='a'
    }

      //건의사항 순위
      var do_inform={
      }
      var do_same_rank1 = {
      }
      var do_same_rank2 = {
      }
      var do_same_rank3 = {
      }
      var do_same_rank4 = {
      }
      var do_same_rank5 = {
      }
      //버스 api 반복
      for(q=0;q<doc1.length;q++){
        var do_al_count = 0;
        var do_good_count=0;
        var do_count=0;
        var do_bus_name = doc1[q].노선명
        //글 작성 개수 만큼 반복
        for(u =0; u<docs.length;u++){
          var do_bus_name_2 = docs[u].busnum
          //버스 번호 동일 시
          if(do_bus_name == do_bus_name_2){
            //카운트
            do_al_count+=1
            if(docs[u].label == "Positive\r\n"){
              do_good_count+=1
            }
          }
        }

        if(do_al_count!=0){
        //해당 버스 번호에 카운트 저장
          do_count=do_good_count/do_al_count*5
        do_inform[do_bus_name] = do_count
        }
    }
  
    let sortobj = [];
    for (let number in do_inform) {
      sortobj.push([number, do_inform[number]]);
    }
    sortobj.sort(function(a, b) {
      return b[1] - a[1];
    });
    let sort_count=0
    if(sort_count<sortobj.length){
    for(var f=0;f<sortobj.length;f++){
      if(f==0){
      sort_count+=1
      do_same_rank1[sortobj[0][0]] = sortobj[0][1]
      }
      else if(sortobj[0][1]==sortobj[f][1]){
        sort_count+=1
        do_same_rank1[sortobj[f][0]] = sortobj[f][1]      
      }
    }
    count1=sortobj[sort_count-1][1]*20
    count1=String(count1)
    count1='width:'+count1+'%;'
  }
    else{
      count1='a'
    }
    let sort_count2=sort_count
    if(sort_count2<sortobj.length){
    for(var f=sort_count;f<sortobj.length;f++){
      if(f==sort_count){
      do_same_rank2[sortobj[f][0]] = sortobj[f][1]
      sort_count2+=1
      }
      else if(sortobj[sort_count][1]==sortobj[f][1]){
        sort_count2+=1
        do_same_rank2[sortobj[f][0]] = sortobj[f][1]      
      }
    }
    count2=sortobj[sort_count][1]*20
    count2=String(count2)
    count2='width:'+count2+'%;'
  }
  else{
    count2='a'
  }

    let sort_count3=sort_count2
    if(sort_count3<sortobj.length){
    for(var f=sort_count2;f<sortobj.length;f++){
      if(f==sort_count2){
        sort_count3+=1
        do_same_rank3[sortobj[f][0]] = sortobj[f][1]
      }
      else if(sortobj[sort_count2][1]==sortobj[f][1]){
        sort_count3+=1
        do_same_rank3[sortobj[f][0]] = sortobj[f][1]      
      }
    }
    count3=sortobj[sort_count2][1]*20
    count3=String(count3)
    count3='width:'+count3+'%;'
  }
  else{
    count3='a'
  }


    let sort_count4=sort_count3
    if(sort_count4<sortobj.length){
    for(var f=sort_count3;f<sortobj.length;f++){
      if(f==sort_count3){
        sort_count4+=1
        do_same_rank4[sortobj[f][0]] = sortobj[f][1]
      }
      else if(sortobj[sort_count3][1]==sortobj[f][1]){
        sort_count4+=1
        do_same_rank4[sortobj[f][0]] = sortobj[f][1]      
      }
    }
    count4=sortobj[sort_count3][1]*20
    count4=String(count4)
    count4='width:'+count4+'%;'
  }
  else{
    count4='a'
  }

    let sort_count5=sort_count4
    if(sort_count5<sortobj.length){
    for(var f=sort_count4;f<sortobj.length;f++){
      if(f==sort_count4){
        sort_count5+=1
        do_same_rank5[sortobj[f][0]] = sortobj[f][1]
      }
      else if(sortobj[sort_count4][1]==sortobj[f][1]){
        sort_count5+=1
        do_same_rank5[sortobj[f][0]] = sortobj[f][1]      
      }
    }
    count5=sortobj[sort_count4][1]*20
    count5=String(count5)
    count5='width:'+count5+'%;'
  }
  else{
    count5='a'
  }
 
        res.render('dashboard', {
          name: user.name,
          docs: docs,
          busnum: user.busnum,
          doc1: doc1,
          doc11: doc11,
          rank11: Object.keys(inform_sum),
          rank12: Object.values(inform_sum),
          rank13:  Object.keys(mpu_star),
          rank14: Object.values(mpu_star),
          rank15: mpusort,
          rank1: Object.keys(same_rank1),
          rank2: Object.keys(same_rank2),
          rank3: Object.keys(same_rank3),
          rank4: Object.keys(same_rank4),
          rank5: Object.keys(same_rank5),
          do_rank1: Object.keys(do_same_rank1),
          do_rank2: Object.keys(do_same_rank2),
          do_rank3: Object.keys(do_same_rank3),
          do_rank4: Object.keys(do_same_rank4),
          do_rank5: Object.keys(do_same_rank5),
          mpu_count1: mpu_count1,
          mpu_count2: mpu_count2,
          mpu_count3: mpu_count3,
          mpu_count4: mpu_count4,
          mpu_count5: mpu_count5,
          count1: count1,
          count2: count2,
          count3: count3,
          count4: count4,
          count5: count5,
          
        })
    })
    })
    })
  })
})


router.get('/post_star', ensureAuthenticated, (req, res) => {
  User.findById(req.user, (err, user) => {
    Document.find((err,docs)=>{
      Bus1.find((err,doc1)=>{
        for(let i = 0; i < docs.length; ++i){
          if(req.user == docs[i].user_id){
            Object.assign(docs[i], {myPost: true})
            }
          }

      let a=[]
      let c=[]
      for(let d = 0; d < docs.length; ++d){
        let aa=docs[d].date
        aa=String(aa)
        aa=aa.split(' ')
        c[d]=aa[1]
        if(c[d]=='May'){
          a[d]=aa[3]+'-05-'+aa[2]+' '+aa[4]
        }
        else if(c[d]=='Apr'){
          a[d]=aa[3]+'-04-'+aa[2]+' '+aa[4]
        }
        else if(c[d]=='Mar'){
          a[d]=aa[3]+'-03-'+aa[2]+' '+aa[4]
        }
        else if(c[d]=='Feb'){
          a[d]=aa[3]+'-02-'+aa[2]+' '+aa[4]
        }
        else if(c[d]=='Jan'){
          a[d]=aa[3]+'-01-'+aa[2]+' '+aa[4]
        }
        else if(c[d]=='Jun'){
          a[d]=aa[3]+'-06-'+aa[2]+' '+aa[4]
        }
        else if(c[d]=='Jul'){
          a[d]=aa[3]+'-07-'+aa[2]+' '+aa[4]
        }
        else if(c[d]=='Aug'){
          a[d]=aa[3]+'-08-'+aa[2]+' '+aa[4]
        }
        else if(c[d]=='Sep'){
          a[d]=aa[3]+'-09-'+aa[2]+' '+aa[4]
        }
        else if(c[d]=='Oct'){
          a[d]=aa[3]+'-10-'+aa[2]+' '+aa[4]
        }
        else if(c[d]=='Nov'){
          a[d]=aa[3]+'-11-'+aa[2]+' '+aa[4]
        }
        else if(c[d]=='Dec'){
          a[d]=aa[3]+'-12-'+aa[2]+' '+aa[4]
        }

      }
      Mpu.find((err,doc11)=>{
        var inform = {
        }
        for(k=0;k<doc1.length;k++){
          var count = 0;
          var bus_name = doc1[k].노선명
          //mpu 개수 만큼 반복
          for(n =0; n<doc11.length;n++){
            var bus_name_2 = doc11[n].busNum
            //버스 번호 동일 시
            if(bus_name == bus_name_2){
              //카운트
              count+=1
            }
          }
          if(count!=0){
          //해당 버스 번호에 카운트 저장
          inform[bus_name] = count
          }

      }
      var inform_sum={}
      for(var x in inform){
        var before_sum=0
        var after_sum=0
        var sum_count=0
        var mpu_da1=0
        var mpu_da2=0
        var mpu_da3=0
        var mpu_da4=0
        var mpu_da5=0
        for(c =0; c<doc11.length;c++){
          if(x==doc11[c].busNum){
            if(mpu_da1==0){
              mpu_da1=doc11[c].angleFiY
              mpu_da1=parseFloat(mpu_da1)
              mpu_da1=Math.abs(mpu_da1)
            }
            else if(mpu_da2==0){
              mpu_da2=doc11[c].angleFiY
              mpu_da2=parseFloat(mpu_da2)
              mpu_da2=Math.abs(mpu_da2)
            }
            else if(mpu_da3==0){
              mpu_da3=doc11[c].angleFiY
              mpu_da3=parseFloat(mpu_da3)
              mpu_da3=Math.abs(mpu_da3)
            }
            else if(mpu_da4==0){
              mpu_da4=doc11[c].angleFiY
              mpu_da4=parseFloat(mpu_da4)
              mpu_da4=Math.abs(mpu_da4)
            }
            else if(mpu_da5==0){
              mpu_da5=doc11[c].angleFiY
              mpu_da5=parseFloat(mpu_da5)
              mpu_da5=Math.abs(mpu_da5)
            }
          }
          //------------------------------우선 교수님이 알려주신 공식대로 mpu 급정거 카운트 방법 바꿈--------------------- 
          if(mpu_da1!=0&&mpu_da2!=0&&mpu_da3!=0&&mpu_da4!=0&&mpu_da5!=0){
            before_sum=((mpu_da1+mpu_da2)/2)*4.6  
            after_sum=(mpu_da3+mpu_da4+mpu_da5)/3
            if(before_sum<after_sum){
              sum_count+=1
            }
            mpu_da1=mpu_da2
            mpu_da2=mpu_da3
            mpu_da3=mpu_da4
            mpu_da4=mpu_da5
            mpu_da5=0
          }
        }
        inform_sum[x]=sum_count
      }
      var mpu_star = {}
      for(var x in inform){
        var mpu_rank_all = (inform[x]-inform_sum[x])/doc11.length
        mpu_star[x]=(100-(mpu_rank_all*100))/20
      }


      let mpusort = [];
      for (let mpu_number in mpu_star) {
        mpusort.push([mpu_number, mpu_star[mpu_number]]);
      }
      mpusort.sort(function(a, b) {
        return a[1] - b[1];
      });

    let mpu_st1= {}
    for(var t=0;t<mpusort.length;t++){
      var e = String(mpusort[t])
      e=e.split(',')
      var e1=String(e[0])
      var e2=parseFloat(e[1])
      e2=e2.toFixed(1)
      mpu_st1[e1]=e2
    }

      //건의사항 순위
      var do_inform={
      }
      //버스 api 반복
      for(q=0;q<doc1.length;q++){
        var do_al_count = 0;
        var do_good_count=0;
        var do_count=0;
        var do_bus_name = doc1[q].노선명
        //글 작성 개수 만큼 반복
        for(u =0; u<docs.length;u++){
          var do_bus_name_2 = docs[u].busnum
          //버스 번호 동일 시
          if(do_bus_name == do_bus_name_2){
            //카운트
            do_al_count+=1
            if(docs[u].label == "Positive\r\n"){
              do_good_count+=1
            }
          }
        }

        if(do_al_count!=0){
        //해당 버스 번호에 카운트 저장
          do_count=do_good_count/do_al_count*5
        do_inform[do_bus_name] = do_count
        }
    }
  
    let sortobj = [];
    for (let number in do_inform) {
      sortobj.push([number, do_inform[number]]);
    }
    sortobj.sort(function(a, b) {
      return b[1] - a[1];
    }); 

    let doc_st1= {}
    for(var t=0;t<sortobj.length;t++){
      var w = String(sortobj[t])
      w=w.split(',')
      var w1=String(w[0])
      var w2=parseFloat(w[1])
      w2=w2.toFixed(1)
      doc_st1[w1]=w2
    }   
        res.render('post_star', {
          name: user.name,
          docs: docs,
          busnum: user.busnum,
          doc1: doc1,
          doc11: doc11,
          mpusort: mpusort,
          a: a,
          eun: Object.keys(mpu_st1),
          seo: Object.values(mpu_st1),
          lee: Object.values(mpu_st1).length,
          do_star1: Object.keys(doc_st1),
          do_star2: Object.values(doc_st1),
        
        })
    })
    })
    })
  })
})




router.get('/busno',ensureAuthenticated2, (req,res)=>{
  const _url = req.url;
  const q2 = url.parse(_url,true).query;
  User.findById(req.user, (err, user) => {
    Document.find((err,docs)=>{
      let all_count = 0;
      let good_count =0;
      let bad_count = 0;
      let count1=0;
      for(let j = 0; j <docs.length; j++){
        if(docs[j].busnum == q2.id){
          all_count++;
          if(docs[j].label == "Positive\r\n"){
            good_count++;
        }
      }
      }
      bad_count=all_count-(good_count)
      count1 = (good_count/all_count*5)*20
      count1=String(count1)
      count1='width:'+count1+'%;'
      Bus1.find((err,doc1)=>{
        for(let i = 0; i < docs.length; ++i){  
          if(req.user == docs[i].user_id){
            Object.assign(docs[i], {myPost: true})
            }
          }
        Mpu.find((err,doc11)=>{ 
          let a=[]
          let c=[]
          for(let d = 0; d < docs.length; ++d){
            let aa=docs[d].date
            aa=String(aa)
            aa=aa.split(' ')
            c[d]=aa[1]
            if(c[d]=='May'){
              a[d]=aa[3]+'-05-'+aa[2]+' '+aa[4]
            }
            else if(c[d]=='Apr'){
              a[d]=aa[3]+'-04-'+aa[2]+' '+aa[4]
            }
            else if(c[d]=='Mar'){
              a[d]=aa[3]+'-03-'+aa[2]+' '+aa[4]
            }
            else if(c[d]=='Feb'){
              a[d]=aa[3]+'-02-'+aa[2]+' '+aa[4]
            }
            else if(c[d]=='Jan'){
              a[d]=aa[3]+'-01-'+aa[2]+' '+aa[4]
            }
            else if(c[d]=='Jun'){
              a[d]=aa[3]+'-06-'+aa[2]+' '+aa[4]
            }
            else if(c[d]=='Jul'){
              a[d]=aa[3]+'-07-'+aa[2]+' '+aa[4]
            }
            else if(c[d]=='Aug'){
              a[d]=aa[3]+'-08-'+aa[2]+' '+aa[4]
            }
            else if(c[d]=='Sep'){
              a[d]=aa[3]+'-09-'+aa[2]+' '+aa[4]
            }
            else if(c[d]=='Oct'){
              a[d]=aa[3]+'-10-'+aa[2]+' '+aa[4]
            }
            else if(c[d]=='Nov'){
              a[d]=aa[3]+'-11-'+aa[2]+' '+aa[4]
            }
            else if(c[d]=='Dec'){
              a[d]=aa[3]+'-12-'+aa[2]+' '+aa[4]
            }

          }
          var inform = {
          }
          for(k=0;k<doc1.length;k++){
            var count = 0;
            var bus_name = doc1[k].노선명
            //mpu 개수 만큼 반복
            for(n =0; n<doc11.length;n++){
              var bus_name_2 = doc11[n].busNum
              //버스 번호 동일 시
              if(bus_name == bus_name_2){
                //카운트
                count+=1
              }
            }
            if(count!=0){
            //해당 버스 번호에 카운트 저장
            inform[bus_name] = count
            }

        }
        var inform_sum={}
        for(var x in inform){
          var before_sum=0
          var after_sum=0
          var sum_count=0
          var mpu_da1=0
          var mpu_da2=0
          var mpu_da3=0
          var mpu_da4=0
          var mpu_da5=0
          for(c =0; c<doc11.length;c++){
            if(x==doc11[c].busNum){
              if(mpu_da1==0){
                mpu_da1=doc11[c].angleFiY
                mpu_da1=parseFloat(mpu_da1)
                mpu_da1=Math.abs(mpu_da1)
              }
              else if(mpu_da2==0){
                mpu_da2=doc11[c].angleFiY
                mpu_da2=parseFloat(mpu_da2)
                mpu_da2=Math.abs(mpu_da2)
              }
              else if(mpu_da3==0){
                mpu_da3=doc11[c].angleFiY
                mpu_da3=parseFloat(mpu_da3)
                mpu_da3=Math.abs(mpu_da3)
              }
              else if(mpu_da4==0){
                mpu_da4=doc11[c].angleFiY
                mpu_da4=parseFloat(mpu_da4)
                mpu_da4=Math.abs(mpu_da4)
              }
              else if(mpu_da5==0){
                mpu_da5=doc11[c].angleFiY
                mpu_da5=parseFloat(mpu_da5)
                mpu_da5=Math.abs(mpu_da5)
              }
            }
            //------------------------------우선 교수님이 알려주신 공식대로 mpu 급정거 카운트 방법 바꿈--------------------- 
            if(mpu_da1!=0&&mpu_da2!=0&&mpu_da3!=0&&mpu_da4!=0&&mpu_da5!=0){
              before_sum=((mpu_da1+mpu_da2)/2)*4.6  
              after_sum=(mpu_da3+mpu_da4+mpu_da5)/3

              if(before_sum<after_sum){
                sum_count+=1
              }
              mpu_da1=mpu_da2
              mpu_da2=mpu_da3
              mpu_da3=mpu_da4
              mpu_da4=mpu_da5
              mpu_da5=0
            }
          }
          inform_sum[x]=sum_count
        }
        var mpu_star = {}
        for(var x in inform){
          var mpu_rank_all = (inform[x]-inform_sum[x])/doc11.length
          mpu_star[x]=(100-(mpu_rank_all*100))/20

        }


        let mpusort = [];

        for (let mpu_number in mpu_star) {
          mpusort.push([mpu_number, mpu_star[mpu_number]]);
        }
        mpusort.sort(function(a, b) {
          return a[1] - b[1];
        });


      let mpu_st1= {}
      var mpu_count=0
      var mpu_all_count=0
      for(var t=0;t<mpusort.length;t++){
        var e = String(mpusort[t])
        e=e.split(',')
        var e1=String(e[0])
        var e2=parseFloat(e[1])
        if(e1 == q2.id){
          mpu_all_count+=1
          mpu_count=e2*20
          mpu_count=String(mpu_count)
          mpu_count='width:'+mpu_count+'%;'
        }
        e2=e2.toFixed(1)
        mpu_st1[e1]=e2

      }



        //건의사항 순위
        var do_inform={
        }
        //버스 api 반복
        for(q=0;q<doc1.length;q++){
          var do_al_count = 0;
          var do_good_count=0;
          var do_count=0;
          var do_bus_name = doc1[q].노선명
          //글 작성 개수 만큼 반복
          for(u =0; u<docs.length;u++){
            var do_bus_name_2 = docs[u].busnum
            //버스 번호 동일 시
            if(do_bus_name == do_bus_name_2){
              //카운트
              do_al_count+=1
              if(docs[u].label == "Positive\r\n"){
                do_good_count+=1
              }
            }
          }

          if(do_al_count!=0){
          //해당 버스 번호에 카운트 저장
            do_count=do_good_count/do_al_count*5
          do_inform[do_bus_name] = do_count
          }
      }

      let sortobj = [];
      for (let number in do_inform) {
        sortobj.push([number, do_inform[number]]);
      }
      sortobj.sort(function(a, b) {
        return b[1] - a[1];
      }); 

      let doc_st1= {}
      for(var t=0;t<sortobj.length;t++){
        var w = String(sortobj[t])
        w=w.split(',')
        var w1=String(w[0])
        var w2=parseFloat(w[1])
        w2=w2.toFixed(1)
        doc_st1[w1]=w2
      }  
      if(q2.id!='-전체보기-'){
      res.render('busno',{
          name: user.name,
          docs: docs,
          busnum: user.busnum,
          doc1: doc1,
          doc11: doc11,
          count1: count1,
          all_count: all_count,
          q2: q2.id,
          a:a,
          eun: Object.keys(mpu_st1),
          seo: Object.values(mpu_st1),
          lee: Object.keys(mpu_st1).length,
          do_star1: Object.keys(doc_st1),
          do_star2: Object.values(doc_st1),
          mpu_count:mpu_count,
          mpu_all_count:mpu_all_count,

  })    }
  if(q2.id=='-전체보기-'){
    res.render('post_star', {
      name: user.name,
      docs: docs,
      busnum: user.busnum,
      doc1: doc1,
      doc11: doc11,
      mpusort: mpusort,
      a: a,
      eun: Object.keys(mpu_st1),
      seo: Object.values(mpu_st1),
      do_star1: Object.keys(doc_st1),
      do_star2: Object.values(doc_st1),
    
    })
      }

      })
   })
  })
  })
})


router.get('/my', ensureAuthenticated, (req, res)=>{
  User.findById(req.user, (err, user) => {
      let name = null;
      if(user){
          name = user.name;
      }
      let mydocs = [];
      Document.find((err,docs)=>{
        for(let i = 0; i < docs.length; ++i){
          if(req.user == docs[i].user_id){
            mydocs.push(docs[i]);
          }
        }

    let a=[]
    let c=[]
    for(let d = 0; d < mydocs.length; ++d){
      let aa=mydocs[d].date
      aa=String(aa)
      aa=aa.split(' ')
      c[d]=aa[1]
      if(c[d]=='May'){
        a[d]=aa[3]+'-05-'+aa[2]+' '+aa[4]
      }
      else if(c[d]=='Apr'){
        a[d]=aa[3]+'-04-'+aa[2]+' '+aa[4]
      }
      else if(c[d]=='Mar'){
        a[d]=aa[3]+'-03-'+aa[2]+' '+aa[4]
      }
      else if(c[d]=='Feb'){
        a[d]=aa[3]+'-02-'+aa[2]+' '+aa[4]
      }
      else if(c[d]=='Jan'){
        a[d]=aa[3]+'-01-'+aa[2]+' '+aa[4]
      }
      else if(c[d]=='Jun'){
        a[d]=aa[3]+'-06-'+aa[2]+' '+aa[4]
      }
      else if(c[d]=='Jul'){
        a[d]=aa[3]+'-07-'+aa[2]+' '+aa[4]
      }
      else if(c[d]=='Aug'){
        a[d]=aa[3]+'-08-'+aa[2]+' '+aa[4]
      }
      else if(c[d]=='Sep'){
        a[d]=aa[3]+'-09-'+aa[2]+' '+aa[4]
      }
      else if(c[d]=='Oct'){
        a[d]=aa[3]+'-10-'+aa[2]+' '+aa[4]
      }
      else if(c[d]=='Nov'){
        a[d]=aa[3]+'-11-'+aa[2]+' '+aa[4]
      }
      else if(c[d]=='Dec'){
        a[d]=aa[3]+'-12-'+aa[2]+' '+aa[4]
      }

    }
    Bus1.find((err,doc1)=>{
    Mpu.find((err,doc11)=>{
      var inform = {
      }
      for(k=0;k<doc1.length;k++){
        var count = 0;
        var bus_name = doc1[k].노선명
        //mpu 개수 만큼 반복
        for(n =0; n<doc11.length;n++){
          var bus_name_2 = doc11[n].busNum
          //버스 번호 동일 시
          if(bus_name == bus_name_2){
            //카운트
            count+=1
          }
        }
        if(count!=0){
        //해당 버스 번호에 카운트 저장
        inform[bus_name] = count
        }

    }
    var inform_sum={}
    for(var x in inform){
      var before_sum=0
      var after_sum=0
      var sum_count=0
      var mpu_da1=0
      var mpu_da2=0
      var mpu_da3=0
      var mpu_da4=0
      var mpu_da5=0
      for(c =0; c<doc11.length;c++){
        if(x==doc11[c].busNum){
          if(mpu_da1==0){
            mpu_da1=doc11[c].angleFiY
            mpu_da1=parseFloat(mpu_da1)
            mpu_da1=Math.abs(mpu_da1)
          }
          else if(mpu_da2==0){
            mpu_da2=doc11[c].angleFiY
            mpu_da2=parseFloat(mpu_da2)
            mpu_da2=Math.abs(mpu_da2)
          }
          else if(mpu_da3==0){
            mpu_da3=doc11[c].angleFiY
            mpu_da3=parseFloat(mpu_da3)
            mpu_da3=Math.abs(mpu_da3)
          }
          else if(mpu_da4==0){
            mpu_da4=doc11[c].angleFiY
            mpu_da4=parseFloat(mpu_da4)
            mpu_da4=Math.abs(mpu_da4)
          }
          else if(mpu_da5==0){
            mpu_da5=doc11[c].angleFiY
            mpu_da5=parseFloat(mpu_da5)
            mpu_da5=Math.abs(mpu_da5)
          }
        }
        //------------------------------우선 교수님이 알려주신 공식대로 mpu 급정거 카운트 방법 바꿈--------------------- 
        if(mpu_da1!=0&&mpu_da2!=0&&mpu_da3!=0&&mpu_da4!=0&&mpu_da5!=0){
          before_sum=((mpu_da1+mpu_da2)/2)*4.6 
          after_sum=(mpu_da3+mpu_da4+mpu_da5)/3

          if(before_sum<after_sum){
            sum_count+=1
          }
          mpu_da1=mpu_da2
          mpu_da2=mpu_da3
          mpu_da3=mpu_da4
          mpu_da4=mpu_da5
          mpu_da5=0
        }
      }
      inform_sum[x]=sum_count
    }
    var mpu_star = {}
    for(var x in inform){
      var mpu_rank_all = (inform[x]-inform_sum[x])/doc11.length
      mpu_star[x]=(100-(mpu_rank_all*100))/20
    }


    let mpusort = [];
    for (let mpu_number in mpu_star) {
      mpusort.push([mpu_number, mpu_star[mpu_number]]);
    }
    mpusort.sort(function(a, b) {
      return a[1] - b[1];
    });

  let mpu_st1= {}
  for(var t=0;t<mpusort.length;t++){
    var e = String(mpusort[t])
    e=e.split(',')
    var e1=String(e[0])
    var e2=parseFloat(e[1])
    e2=e2.toFixed(1)
    mpu_st1[e1]=e2
  }
    //건의사항 순위
    var do_inform={
    }
    //버스 api 반복
    for(q=0;q<doc1.length;q++){
      var do_al_count = 0;
      var do_good_count=0;
      var do_count=0;
      var do_bus_name = doc1[q].노선명
      //글 작성 개수 만큼 반복
      for(u =0; u<docs.length;u++){
        var do_bus_name_2 = docs[u].busnum
        //버스 번호 동일 시
        if(do_bus_name == do_bus_name_2){
          //카운트
          do_al_count+=1
          if(docs[u].label == "Positive\r\n"){
            do_good_count+=1
          }
        }
      }

      if(do_al_count!=0){
      //해당 버스 번호에 카운트 저장
        do_count=do_good_count/do_al_count*5
      do_inform[do_bus_name] = do_count
      }
  }

  let sortobj = [];
  for (let number in do_inform) {
    sortobj.push([number, do_inform[number]]);
  }
  sortobj.sort(function(a, b) {
    return b[1] - a[1];
  }); 

  let doc_st1= {}
  for(var t=0;t<sortobj.length;t++){
    var w = String(sortobj[t])
    w=w.split(',')
    var w1=String(w[0])
    var w2=parseFloat(w[1])
    w2=w2.toFixed(1)
    doc_st1[w1]=w2
  }   
        res.render('postMy', {
          name: name,
          docs: mydocs,
          a:a,
          eun: Object.keys(mpu_st1),
          seo: Object.values(mpu_st1),
          lee: Object.keys(mpu_st1).length,
          do_star1: Object.keys(doc_st1),
          do_star2: Object.values(doc_st1),
        })
      })
    })
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

router.get('/layout', ensureAuthenticated,(req, res)=>{

  User.findById(req.user, (err, user)=>{
      res.render('layout', {
          name: user.name,

      })
  })
  
})






module.exports = router;