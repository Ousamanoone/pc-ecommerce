const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ['News', 'Guide', 'Promotion', 'Review'],
      default: 'News',
    },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    author: { type: String, default: 'GearStore Staff' },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected'],
      default: 'pending',
    },
    moderationNote: { type: String, default: '' },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);