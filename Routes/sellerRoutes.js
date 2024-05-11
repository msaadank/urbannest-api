const express = require('express')
const router = express.Router()
const cors = require('cors')
const {requestForSeller, completeProfile, toggleSelling, profileImageUpload} = require('../controllers/sellerController');
const { verifySellingProfile, authMiddleware, verifyToken } = require('../middlewares/authMiddleware');

router.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173',
        methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE']
    })
)

router.patch('/become-a-seller', authMiddleware, verifySellingProfile, requestForSeller)
router.patch('/complete-profile', verifyToken, completeProfile)
router.patch('/toggle-selling', authMiddleware, verifySellingProfile, toggleSelling)
router.patch('/upload-profile-image', profileImageUpload)

module.exports = router