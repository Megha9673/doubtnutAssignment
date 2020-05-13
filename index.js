const express = require('express')
const app = express()
const mongoose = require('mongoose')
const pdf = require('html-pdf')
const fs = require('fs')
const async = require("async")
const bodyParser = require('body-parser')
const options = {format: 'Letter'}
const schedule = require('node-schedule')
const nodemailer = require('nodemailer')
//const transporter = nodemailer.createTransport('')
const json2html = require('node-json2html')
let html = json2html.transform([{'ques':'Question1','answer':'This is answer'},{'ques':'Question2','answer':'This is answer'}],{"<>":"div","html":"${ques} likes ${answer}"})

db = require('./model/localVar');
mongoose.connect(db.getDbPath())
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.log(err));
        
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({limit: "200mb", extended: true, parameterLimit:200000}));

const User = require('./model/user')

app.post('/createUser',(req,res)=>{
    User.create({name:'Megha',emailId:'megha@gmail.com'},(err,created)=>{
        if(err) res.json(err)
        else res.json('Created user:'+created.id)
    })
})


app.post('/updateVideoTime',(req,res)=>{
    User.findOne({_id:req.body.userId},(err,user)=>{
        if(!user){
            res.json('No user found')
        }else{
            let date = new Date(new Date().getTime() + 5 * 60000)
            console.log(date)
            User.update({_id:req.body.userId},{pdfInput:req.body.pdfInput,pdfTime:date},(err1,updated)=>{
                res.json('updated')
            })
        }
    })
})


schedule.scheduleJob('01 * * * * *',function (req, res) {
    console.log('scheduler working')
    let date1 = new Date(new Date().setSeconds(0))
    let date2 = new Date(new Date().setSeconds(59))
    console.log(date1)
    console.log(date2)
    User.find({pdfTime:{$gte:date1,$lte:date2}},(err,users)=>{
        async.each(users,(user,cb)=>{
            console.log(user)
            html = json2html.transform([user.pdfInput],{"<>":"div","html":"${question} : ${answer}"});
            console.log(html)
            pdf.create(html, options).toFile('./downloads/answer'+user._id+'.pdf', function (err, result) {
                if (err) {
                    console.log('error')
                }
            })
            transporter.sendMail({
                from: 'test@gmail.com',
                to: user.emailId,
                subject: 'An Attached File',
                text: 'Check out this attached pdf file',
                attachments: [{
                  filename: 'answers.pdf',
                  path: './downloads/answer'+user._id+'.pdf',
                  contentType: 'application/pdf'
                }],
                function(err, info) {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log(info);
                  }
                }
            });
            cb()
        })
    })
})

var server = require('http').Server(app);
server.listen(3000)