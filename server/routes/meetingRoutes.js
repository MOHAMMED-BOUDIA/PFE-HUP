const router = require('express').Router();
const { createMeeting, getMeetingsByProject, updateMeeting, deleteMeeting } = require('../controllers/meetingController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('instructor', 'admin'), createMeeting);
router.get('/project/:projectId', auth, getMeetingsByProject);
router.put('/:id', auth, authorize('instructor', 'admin'), updateMeeting);
router.delete('/:id', auth, authorize('instructor', 'admin'), deleteMeeting);

module.exports = router;