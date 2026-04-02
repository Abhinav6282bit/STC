const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  sectionKey: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Content', ContentSchema);
