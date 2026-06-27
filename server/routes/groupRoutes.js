const router = require('express').Router();
const multer = require('multer');
const { auth, authorize } = require('../middleware/auth');
const {
  getAllGroups,
  getGroupsByInstructor,
  getMyGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  requestJoinGroup,
  approveMember,
  rejectMember,
  getMyMembership,
  getPendingRequests
} = require('../controllers/groupController');
const { groupImageStorage } = require('../config/cloudinary');

const upload = multer({
  storage: groupImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', auth, getAllGroups);
router.get('/my', auth, authorize('instructor'), getMyGroups);
router.get('/instructor/:instructorId', auth, getGroupsByInstructor);
router.post('/', auth, authorize('instructor'), upload.single('image'), createGroup);
router.put('/:id', auth, upload.single('image'), updateGroup);
router.delete('/:id', auth, deleteGroup);
router.get('/pending-requests', auth, authorize('instructor'), getPendingRequests);
router.get('/my-membership', auth, authorize('student'), getMyMembership);
router.post('/:id/request-join', auth, authorize('student'), requestJoinGroup);
router.post('/:id/approve/:userId', auth, authorize('instructor'), approveMember);
router.post('/:id/reject/:userId', auth, authorize('instructor'), rejectMember);
router.post('/:id/join', auth, authorize('student'), joinGroup);
router.post('/:id/leave', auth, leaveGroup);

module.exports = router;
