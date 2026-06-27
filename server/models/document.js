const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  file: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['rapport', 'presentation', 'code', 'other'],
    default: 'other'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comment: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.models.Document || mongoose.model('Document', documentSchema);