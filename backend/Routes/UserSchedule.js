const express=require('express')
const router=express.Router()
const scheduleController=require('../controller/UserSchedule')
const {isLoggedIn}=require('../middlewares/user')

router.get('/user_schedule_getAll',isLoggedIn, scheduleController.getAll);
router.get('/user_schedule_getByID:id',isLoggedIn, scheduleController.getById);
router.post('/user_schedule_create',isLoggedIn, scheduleController.create);
router.put('/user_schedule_update:id',isLoggedIn, scheduleController.update);
router.delete('/user_schedule_delete:id',isLoggedIn, scheduleController.delete);
module.exports=router;