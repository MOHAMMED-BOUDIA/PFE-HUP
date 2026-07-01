const router = require('express').Router();
const { getUserNotifications, createNotification, markAsRead, markAllRead, getUnreadCount, deleteNotification } = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getUserNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.post('/', auth, createNotification);
router.patch('/:id/read', auth, markAsRead);
router.patch('/read-all', auth, markAllRead);
router.delete('/:id', auth, deleteNotification);

module.exports = router;
