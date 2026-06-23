const Group = require('../models/Group');

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('instructor', 'name email avatar department')
      .populate('members', 'name email avatar');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGroupsByInstructor = async (req, res) => {
  try {
    const groups = await Group.find({ instructor: req.params.instructorId })
      .populate('instructor', 'name email avatar department')
      .populate('members', 'name email avatar');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ instructor: req.user._id })
      .populate('instructor', 'name email avatar department')
      .populate('members', 'name email avatar');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, description, specialty, maxMembers } = req.body;
    const group = new Group({
      name,
      description,
      specialty,
      maxMembers,
      instructor: req.user._id,
      image: req.file ? `/uploads/groups/${req.file.filename}` : ''
    });
    await group.save();
    const populated = await Group.findById(group._id)
      .populate('instructor', 'name email avatar department')
      .populate('members', 'name email avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updates = { ...req.body };
    if (req.file) {
      updates.image = `/uploads/groups/${req.file.filename}`;
    }
    const updated = await Group.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('instructor', 'name email avatar department')
      .populate('members', 'name email avatar');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.status === 'closed') return res.status(400).json({ message: 'Group is closed' });
    if (group.members.some(m => m.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already a member' });
    }
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }
    group.members.push(req.user._id);
    await group.save();
    const populated = await Group.findById(group._id)
      .populate('instructor', 'name email avatar department')
      .populate('members', 'name email avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    group.members = group.members.filter(m => m.toString() !== req.user._id.toString());
    await group.save();
    const populated = await Group.findById(group._id)
      .populate('instructor', 'name email avatar department')
      .populate('members', 'name email avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
