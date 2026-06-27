const Group = require('../models/Group');
const User = require('../models/user');

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
      .populate('members', 'name email avatar')
      .populate('pendingRequests', 'name email avatar');
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
      image: req.file ? req.file.path : ''
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
      updates.image = req.file.path;
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

exports.requestJoinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.status === 'closed') return res.status(400).json({ message: 'Group is closed' });
    if (group.members.some(m => m.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already a member' });
    }
    if (group.pendingRequests.some(m => m.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Join request already pending' });
    }
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }
    group.pendingRequests.push(req.user._id);
    await group.save();
    const populated = await Group.findById(group._id)
      .populate('instructor', 'name email avatar department')
      .populate('members', 'name email avatar')
      .populate('pendingRequests', 'name email avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const userId = req.params.userId;
    if (!group.pendingRequests.some(m => m.toString() === userId)) {
      return res.status(400).json({ message: 'No pending request from this user' });
    }
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }
    group.pendingRequests = group.pendingRequests.filter(m => m.toString() !== userId);
    group.members.push(userId);
    await group.save();

    // Auto-set student department to instructor's department
    const student = await User.findById(userId);
    if (student && group.instructor) {
      const instructor = await User.findById(group.instructor);
      if (instructor && instructor.department) {
        student.department = instructor.department;
        await student.save();
      }
    }
    const populated = await Group.findById(group._id)
      .populate('instructor', 'name email avatar department')
      .populate('members', 'name email avatar')
      .populate('pendingRequests', 'name email avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const userId = req.params.userId;
    if (!group.pendingRequests.some(m => m.toString() === userId)) {
      return res.status(400).json({ message: 'No pending request from this user' });
    }
    group.pendingRequests = group.pendingRequests.filter(m => m.toString() !== userId);
    await group.save();
    const populated = await Group.findById(group._id)
      .populate('instructor', 'name email avatar department')
      .populate('members', 'name email avatar')
      .populate('pendingRequests', 'name email avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyMembership = async (req, res) => {
  try {
    const groups = await Group.find({ $or: [
      { members: req.user._id },
      { pendingRequests: req.user._id }
    ]}).populate('instructor', 'name email avatar department');

    const approved = groups.find(g => g.members.some(m => m._id.toString() === req.user._id.toString() || m.toString() === req.user._id.toString()));
    const pending = groups.find(g => g.pendingRequests.some(m => m._id?.toString() === req.user._id.toString() || m.toString() === req.user._id.toString()));

    if (approved) {
      return res.json({ status: 'approved', group: approved });
    }
    if (pending) {
      return res.json({ status: 'pending', group: pending });
    }
    res.json({ status: 'none', group: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const groups = await Group.find({ instructor: req.user._id })
      .select('name pendingRequests')
      .populate('pendingRequests', 'name email avatar');

    const requests = groups
      .filter(g => g.pendingRequests && g.pendingRequests.length > 0)
      .flatMap(g => g.pendingRequests.map(student => ({
        groupId: g._id,
        groupName: g.name,
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          avatar: student.avatar
        }
      })));

    res.json({ count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
