const Meeting = require('../models/Meeting');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Notification = require('../models/Notification');
const { getIO } = require('../socket');

exports.createMeeting = async (req, res) => {
  try {
    const meeting = new Meeting({ ...req.body, organizer: req.user._id });
    await meeting.save();

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('organizer', 'name avatar');

    // Find students to notify via project → team → members
    let studentIds = [];
    if (req.body.project) {
      const project = await Project.findById(req.body.project).populate({
        path: 'team',
        populate: { path: 'members', select: '_id' }
      });
      if (project?.team?.members?.length > 0) {
        studentIds = project.team.members.map(m => m._id.toString());
      }
    }

    // Also include any explicitly specified participants
    if (req.body.participants?.length > 0) {
      req.body.participants.forEach(pid => {
        const pidStr = pid._id || pid;
        if (!studentIds.includes(pidStr.toString())) {
          studentIds.push(pidStr.toString());
        }
      });
    }

    const link = `/meetings/${meeting._id}`;
    const title = 'New Meeting Scheduled';
    const message = `${req.user.name} scheduled a meeting: "${req.body.title}"`;

    const io = getIO();

    // Create notifications and emit socket events
    for (const studentId of studentIds) {
      const notification = await Notification.create({
        recipient: studentId,
        sender: req.user._id,
        type: 'meeting',
        title,
        message,
        link,
        relatedId: meeting._id
      });
      const populated = await notification.populate('sender', 'name avatar');
      io.to(`user:${studentId}`).emit('notification', populated);
    }

    res.status(201).json(populatedMeeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMeetingsByProject = async (req, res) => {
  try {
    const meetings = await Meeting.find({ project: req.params.projectId })
      .populate('organizer', 'name')
      .populate('participants', 'name email');
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meeting deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
