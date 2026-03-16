const router = require('express').Router()
// import auth controller
const AuthController = require('../controllers/AuthController')

// Import auth middleware
 const {protect} = require('../middleware/auth')

//import validation
// const check = require('../validation/CheckValidation')
// const auth = require('../middleware/authVerification')
// route list------------------------------------------------------------------------------------

// Router.js
router.post('/check-login',AuthController.isAlreadyLoggedin)
//mobile
router.post('/login',AuthController.authLogin);
router.post('/checklogin',AuthController.AlreadyLoggedin)
router.post('/forcelogin',AuthController.forceloginDeviceId)

  
//router.post('/forgotPassword',AuthController.forgotPassword)
//admin,
router.post('/resetPassword',protect,AuthController.resetPassword)
router.post('/getPlayerVendor',AuthController.getPlayerVendor)

router.post('/updateAdminDetails', protect, AuthController.updateAdminDetails);
router.post('/getAdminDetails', protect, AuthController.getAdminDetails);

router.get('/getAdminDetails',  AuthController.getAdmin);




router.post('/logout', AuthController.logout);


router.post('/createStateId', protect,AuthController.createStateId)
router.post('/createCityId',protect,AuthController.createCityId)
router.post('/createMainId',protect,AuthController.createMainId)
router.post('/createPlayerId',protect,AuthController.createPlayerId)
router.get("/getPassword", protect,AuthController.getPass)
router.post("/Checkplayerlist",protect, AuthController.Checkplayerlist)

router.post("/changePassword", protect,AuthController.changePassword)
 
router.post('/signUp',AuthController.authSignUp)
router.post('/adduserbyadmin',protect , AuthController.adduserbyadmin)
 router.post('/getRoleId',protect,AuthController.getRoleIdFromEmail)



//router.post('/signUp',check.registerValidator(),AuthController.authSignUp)
//router.post('/login',check.loginValidator(),AuthController.authLogin)
//router.post('/forgotPassword',check.forgotPasswordValidator(),AuthController.forgotPassword)


module.exports = router