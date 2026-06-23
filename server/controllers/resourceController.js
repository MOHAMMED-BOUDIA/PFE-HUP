const Resource = require('../models/Resource');

exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createResource = async (req, res) => {
  try {
    const { title, description, url, category } = req.body;
    const resource = new Resource({
      title,
      description,
      url,
      category,
      postedBy: req.user._id
    });
    await resource.save();
    const populated = await resource.populate('postedBy', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const { title, description, url, category } = req.body;
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { title, description, url, category },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
