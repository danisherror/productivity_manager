const express=require('express')
const router=express.Router()
const {signup,signin,logout,userProfile,getUserRecord,verifyEmail,resendVerificationEmail}=require('../controller/userController')
const {isLoggedIn}=require('../middlewares/user')

router.route('/signup').post(signup)
router.route('/signin').post(signin)
router.route('/logout').post(logout)
router.route('/userProfile').get(isLoggedIn,userProfile)
router.route('/userRecord').get(isLoggedIn,getUserRecord)
router.route('/verify-email').get(verifyEmail)
router.route('/resend-verification-email').get(resendVerificationEmail)

router.get('/me', isLoggedIn, (req, res) => {
  res.status(200).json({ user: req.user });
});
module.exports=router;