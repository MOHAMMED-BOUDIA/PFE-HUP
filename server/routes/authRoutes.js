const router = require('express').Router();
const { register, login, getMe, verifyEmail, forgotPassword, resetPassword, oauthLogin } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/oauth-login', oauthLogin);
router.get('/verify/:token', verifyEmail);
router.get('/me', auth, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;