const Challenge = require('../models/Challenge');

exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .populate('postedBy', 'name email')
      .sort({ rank: 1, createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createChallenge = async (req, res) => {
  try {
    const { title, description, category, technologies, author, projectUrl, image, rank } = req.body;
    const challenge = new Challenge({
      title,
      description,
      category,
      technologies: technologies || [],
      author,
      projectUrl,
      image: image || '',
      rank: rank || null,
      postedBy: req.user._id
    });
    await challenge.save();
    const populated = await challenge.populate('postedBy', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateChallenge = async (req, res) => {
  try {
    const { title, description, category, technologies, author, projectUrl, image, rank } = req.body;
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { title, description, category, technologies, author, projectUrl, image, rank },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json({ message: 'Challenge deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleVote = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const userId = req.user._id;
    const index = challenge.votes.indexOf(userId);

    if (index === -1) {
      challenge.votes.push(userId);
    } else {
      challenge.votes.splice(index, 1);
    }

    await challenge.save();
    const populated = await challenge.populate('postedBy', 'name email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
