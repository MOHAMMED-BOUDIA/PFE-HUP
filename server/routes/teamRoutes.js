const router = require('express').Router();
const { createTeam, getAllTeams, getTeamById, updateTeam, deleteTeam, addMember, removeMember } = require('../controllers/teamController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('instructor', 'admin'), createTeam);
router.get('/', auth, getAllTeams);
router.get('/:id', auth, getTeamById);
router.put('/:id', auth, authorize('instructor', 'admin'), updateTeam);
router.delete('/:id', auth, authorize('instructor', 'admin'), deleteTeam);
router.post('/:id/add-member', auth, authorize('instructor', 'admin'), addMember);
router.post('/:id/remove-member', auth, authorize('instructor', 'admin'), removeMember);

module.exports = router;