const router = require('express').Router();
const { getResources, createResource, updateResource, deleteResource } = require('../controllers/resourceController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, getResources);
router.post('/', auth, authorize('instructor', 'admin'), createResource);
router.put('/:id', auth, authorize('instructor', 'admin'), updateResource);
router.delete('/:id', auth, authorize('instructor', 'admin'), deleteResource);

module.exports = router;
