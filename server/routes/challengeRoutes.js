const router = require('express').Router();
const { getChallenges, createChallenge, updateChallenge, deleteChallenge, toggleVote } = require('../controllers/challengeController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, getChallenges);
router.post('/', auth, authorize('instructor', 'admin'), createChallenge);
router.put('/:id', auth, authorize('instructor', 'admin'), updateChallenge);
router.delete('/:id', auth, authorize('instructor', 'admin'), deleteChallenge);
router.post('/:id/vote', auth, toggleVote);

module.exports = router;
