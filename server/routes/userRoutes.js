const router = require('express').Router();
const multer = require('multer');
const { getAllUsers, getUserById, updateUser, updateAvatar, deleteUser, getInstructors, getStudents, createUser, getMyInstructor } = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');
const { avatarStorage } = require('../config/cloudinary');

const upload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', auth, getAllUsers);
router.post('/', auth, authorize('admin'), createUser);
router.get('/instructors', auth, getInstructors);
router.get('/students', auth, getStudents);
router.get('/my-instructor', auth, authorize('student'), getMyInstructor);
router.get('/:id', auth, getUserById);
router.put('/:id/avatar', auth, upload.single('avatar'), updateAvatar);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, authorize('admin'), deleteUser);

module.exports = router;
