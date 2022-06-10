const express = require('express')
const router = express.Router()
const Mpu = require('../models/mpu6050')
const Bus1 = require('../models/bus')

const Document = require('../models/document')
const User = require('../models/user')

router.post('/',(req, res)=>{
    User.findById({_id : req.user}, (err, user)=>{
        let name = null;
        if(user){
            name = user.name;
        }
 

        const keyword = req.body.keyword;
        const searchDoc = [];
        Document.find((err, docs)=>{
            if(docs){
                for(let i = 0; i < docs.length; ++i){
                    let main = docs[i].main;
                    if(main.search(keyword) != -1){
                        if(name && req.user == docs[i].user_id){
                            Object.assign(docs[i],{myPost: true});
                        }
                        searchDoc.push(docs[i]);
                    }
                }
            }
                                    //5월 17일 수정 중------------
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
            Bus1.find((err,doc1)=>{
            Mpu.find((err,doc11)=>{
                var inform = {
                }
                //------------------------5월 20일 추가 중인 코드--------------------------------------------------------------------------
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
                    before_sum=((mpu_da1+mpu_da2)/2)*4.6  //우선 임의로 n을 2.5로 줌
                    after_sum=(mpu_da3+mpu_da4+mpu_da5)/3
                    //sum=((mpu_da1+mpu_da2+mpu_da3+mpu_da4+mpu_da5)/5)*2
                    //if(mpu_da3>=sum){
                      //sum_count+=1
                    //}
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
        //----------------------------------------------------------------------------------------
        
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
            res.render('search',{
                name: name,
                docs: searchDoc,
                a: a,
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
router.get('/',(req, res)=>{
  User.findById({_id : req.user}, (err, user)=>{
      let name = null;
      if(user){
          name = user.name;
      }


      const keyword = req.body.keyword;
      const searchDoc = [];
      Document.find((err, docs)=>{
          if(docs){
              for(let i = 0; i < docs.length; ++i){
                  let main = docs[i].main;
                  if(main.search(keyword) != -1){
                      if(name && req.user == docs[i].user_id){
                          Object.assign(docs[i],{myPost: true});
                      }
                      searchDoc.push(docs[i]);
                  }
              }
          }
                                  //5월 17일 수정 중------------
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
          Bus1.find((err,doc1)=>{
          Mpu.find((err,doc11)=>{
              var inform = {
              }
              //------------------------5월 20일 추가 중인 코드--------------------------------------------------------------------------
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
                  before_sum=((mpu_da1+mpu_da2)/2)*4.6  //우선 임의로 n을 2.5로 줌
                  after_sum=(mpu_da3+mpu_da4+mpu_da5)/3
                  //sum=((mpu_da1+mpu_da2+mpu_da3+mpu_da4+mpu_da5)/5)*2
                  //if(mpu_da3>=sum){
                    //sum_count+=1
                  //}
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
      //----------------------------------------------------------------------------------------
      
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
          res.render('search',{
              name: name,
              docs: searchDoc,
              a: a,
              eun: Object.keys(mpu_st1),
              seo: Object.values(mpu_st1),
              do_star1: Object.keys(doc_st1),
              do_star2: Object.values(doc_st1),
          })
      })
  })
      })
  })
})
module.exports = router