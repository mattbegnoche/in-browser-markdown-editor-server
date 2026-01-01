const mongoose = require('mongoose');

const markdownSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A markdown document must have a title'],
  },
  content: {
    type: String,
    required: [true, 'A markdown document must have content'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A markdown document must belong to at least one user'],
  }],
});

const Markdown = mongoose.model('Markdown', markdownSchema);

module.exports = Markdown;
