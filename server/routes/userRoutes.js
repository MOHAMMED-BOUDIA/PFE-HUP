const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getAllUsers, getUserById, updateUser, updateAvatar, deleteUser, getInstructors, getStudents, createUser } = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

const avatarDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => cb(null, `avatar-${req.params.id}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
  }
});

router.get('/', auth, getAllUsers);
router.post('/', auth, authorize('admin'), createUser);
router.get('/instructors', auth, getInstructors);
router.get('/students', auth, getStudents);
router.get('/:id', auth, getUserById);
router.put('/:id/avatar', auth, upload.single('avatar'), updateAvatar);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, authorize('admin'), deleteUser);

module.exports = router;