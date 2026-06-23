const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, authorize } = require('../middleware/auth');
const {
  getAllGroups,
  getGroupsByInstructor,
  getMyGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup
} = require('../controllers/groupController');

const groupImgDir = path.join(__dirname, '..', 'uploads', 'groups');
if (!fs.existsSync(groupImgDir)) {
  fs.mkdirSync(groupImgDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, groupImgDir),
  filename: (req, file, cb) => cb(null, `group-${Date.now()}${path.extname(file.originalname)}`)
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

router.get('/', auth, getAllGroups);
router.get('/my', auth, authorize('instructor'), getMyGroups);
router.get('/instructor/:instructorId', auth, getGroupsByInstructor);
router.post('/', auth, authorize('instructor'), upload.single('image'), createGroup);
router.put('/:id', auth, upload.single('image'), updateGroup);
router.delete('/:id', auth, deleteGroup);
router.post('/:id/join', auth, authorize('student'), joinGroup);
router.post('/:id/leave', auth, leaveGroup);

module.exports = router;
