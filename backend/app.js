const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config()
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}))        //to handle something comming in the body
app.use(cookieParser());

// Your routes here
app.use(cors({
    origin: process.env.front_end_url,
    credentials: true  
}));

const user=require('./Routes/users')

app.use("/api",user)

module.exports=app;