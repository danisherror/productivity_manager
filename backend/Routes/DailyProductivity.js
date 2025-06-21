const express=require('express')
const router=express.Router()
const daily_ProductivityController=require('../controller/DailyProductivityController')
const {isLoggedIn}=require('../middlewares/user')
router.get('/user_daily_Productivity_getAll',isLoggedIn, daily_ProductivityController.getAll);
router.get('/user_daily_Productivity_getByID/:id',isLoggedIn, daily_ProductivityController.getById);
router.post('/user_daily_Productivity_create',isLoggedIn, daily_ProductivityController.create);
router.put('/user_daily_Productivity_update/:id',isLoggedIn, daily_ProductivityController.update);
router.delete('/user_daily_Productivity_delete/:id',isLoggedIn, daily_ProductivityController.delete);
router.get('/user_daily_Productivity_getSummary',isLoggedIn, daily_ProductivityController.getSummary);

module.exports=router;