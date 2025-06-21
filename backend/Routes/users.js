const express=require('express')
const router=express.Router()
const {signup,signin,logout,userProfile,getUserRecord,verifyEmail,updatePassword,verifyPassword,forgotPassword, resetPassword}=require('../controller/userController')
const {isLoggedIn}=require('../middlewares/user')

router.route('/signup').post(signup)
router.route('/signin').post(signin)
router.route('/logout').post(logout)
router.route('/userProfile').get(isLoggedIn,userProfile)
router.route('/userRecord').get(isLoggedIn,getUserRecord)
router.route('/verify-email').get(verifyEmail)
router.route('/updatePassword').post(isLoggedIn,updatePassword)
router.route('/verifyPassword').post(isLoggedIn,verifyPassword)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:token').post(resetPassword)
router.get('/me', isLoggedIn, (req, res) => {
  res.status(200).json({ user: req.user });
});
module.exports=router;