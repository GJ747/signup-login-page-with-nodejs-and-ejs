const express = require("express");
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var session = require('express-session');
const path = require('path');
const User = require('./database/user')

app.use(session({secret: "Shh, its a secret!"}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 

app.set('views',path.join(__dirname,'/views'));
app.set('view engine', 'ejs');

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://localhost:27017/test_Login_signup');
    console.log("database started")
  }
  app.get('/', async (req,res)=>{
    
    res.render('home.ejs')
})
  
app.get('/signup',(req,res)=>{
    res.render('signup.ejs')
})

app.post('/signup',async(req,res,next)=>{
    const {username,password} = req.body;
    const hash = await bcrypt.hash(password,10);
    const user = new User({
        username,
        password: hash
    })
    await user.save();
    res.redirect('/login')
})

app.get('/login',(req,res)=>{
    res.render('login.ejs')
})

app.post('/login',async (req,res)=>{
    const {username,password} = req.body;
    const user = await User.findOne({username});
    const validPassword = await bcrypt.compare(password,user.password)
    if(validPassword){
        req.session.userid = user._id;
        res.redirect('/user')
    }
})


app.get('/user',async(req,res)=>{
    if(req.session.userid){
        res.render('user.ejs')
    }else{
        res.send('please login')
    }
})

app.post('/sessionDistroy',(req,res)=>{
    req.session.userid = null
    res.redirect('/login')
})


app.listen(3000,()=>{
    console.log("server started");
})