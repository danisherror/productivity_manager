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
const userSchedule = require('./Routes/UserSchedule')
const kanbanBoard = require('./Routes/kanbanBoard');
const kanbanComment = require('./Routes/kanbanComment');
const kanbanTask = require('./Routes/kanbanTask');
const kanbanColumn = require('./Routes/kanbanBoardColumns');
const dailyProductivity = require('./Routes/DailyProductivity')
const userExpense = require('./Routes/UserExpenses');
app.use("/",user)
app.use("/",userSchedule)
app.use("/",kanbanBoard)
app.use("/",kanbanComment)
app.use("/",kanbanTask)
app.use("/",kanbanColumn)
app.use("/",dailyProductivity)
app.use("/",userExpense)
module.exports=app;