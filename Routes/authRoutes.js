const express = require('express')
const router = express.Router()
const cors = require('cors')
const { test, registerUser, loginUser, getProfile, logoutUser, generateOtp, resetPassword, testEmail, verifyOtp, googleAuth } = require('../controllers/authController')
const {authMiddleware} = require('../middlewares/authMiddleware')
// const {registerMail} = require('../controllers/mailer')

//middleware
router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173',
        methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE']
    })
)

router.get('/', test)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', authMiddleware, getProfile)
router.get('/logout', logoutUser)
router.get('/forgot-password', generateOtp)
router.get('/forgot-password/otp', verifyOtp)
router.post('/resetPassword', resetPassword)
router.get('/email-test', testEmail)

router.post('/auth/google', googleAuth)

module.exports = router