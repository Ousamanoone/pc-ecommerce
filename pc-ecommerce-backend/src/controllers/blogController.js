const Blog = require('../models/Blog');

// @desc    Lấy danh sách bài viết công khai (chỉ lấy bài đã duyệt 'published')
// @route   GET /api/v1/blogs
exports.getBlogs = async (req, res) => {
  try {
    const { category, limit = 10, search } = req.query;
    const query = { status: 'published' };

    if (category && category !== 'ALL') {
      query.category = category;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy toàn bộ bài viết cho Admin/Staff (gồm pending, rejected, published)
// @route   GET /api/v1/blogs/admin/all
exports.getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy chi tiết 1 bài viết theo slug
// @route   GET /api/v1/blogs/:slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    blog.views += 1;
    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tạo bài viết mới
// @route   POST /api/v1/blogs
exports.createBlog = async (req, res) => {
  try {
    const { title, summary, content, category, coverImage, tags, status } = req.body;

    const slug =
      title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-') +
      '-' +
      Date.now().toString().slice(-4);

    // Nếu người tạo là admin thì có thể trực tiếp published, ngược lại mặc định là pending
    const initialStatus =
      req.user?.role === 'admin' && status ? status : 'pending';

    const blog = new Blog({
      title,
      slug,
      summary,
      content,
      category,
      coverImage,
      tags: Array.isArray(tags)
        ? tags
        : (tags || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
      author: req.user?.name || 'GearStore Author',
      authorId: req.user?._id,
      status: initialStatus,
    });

    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Kiểm duyệt bài viết (Duyệt / Từ chối)
// @route   PUT /api/v1/blogs/:id/moderate
exports.moderateBlog = async (req, res) => {
  try {
    const { status, moderationNote } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    if (!['published', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid moderation status.' });
    }

    blog.status = status;
    if (moderationNote !== undefined) {
      blog.moderationNote = moderationNote;
    }

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa bài viết
// @route   DELETE /api/v1/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    await blog.deleteOne();
    res.json({ message: 'Article deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Lấy danh sách bài viết
// @route   GET /api/v1/blogs
exports.getBlogs = async (req, res) => {
  try {
    const { category, limit = 50, search } = req.query;
    const query = {};

    if (category && category !== 'ALL') {
      query.category = category;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Trả về toàn bộ bài viết sắp xếp theo mới nhất
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};