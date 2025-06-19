const express=require('express')
const router=express.Router()
const {signup,signin,logout,userProfile}=require('../controller/userController')
const {isLoggedIn}=require('../middlewares/user')

router.route('/signup').post(signup)
router.route('/signin').post(signin)
router.route('/logout').post(logout)
router.route('/userProfile').get(isLoggedIn,userProfile)
module.exports=router;