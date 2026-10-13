const Product = require('../models/Product');

// @desc    Get all products with multi-facet filters, search, and pagination
// @route   GET /api/v1/products
exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sort,
      limit = 50,
      page = 1,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (brand && brand !== 'ALL') {
      const brandList = brand.split(',').map((b) => b.trim()).filter(Boolean);
      if (brandList.length > 0) {
        query.brand = { $in: brandList.map((b) => new RegExp(`^${b}$`, 'i')) };
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice && !isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1, numReviews: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const pageSize = Number(limit);
    const currentPage = Number(page);
    const skip = (currentPage - 1) * pageSize;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    res.json({
      products,
      page: currentPage,
      pages: Math.ceil(totalProducts / pageSize),
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by slug or ID
// @route   GET /api/v1/products/:slugOrId
exports.getProductBySlug = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    let product;

    if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(slugOrId);
    } else {
      product = await Product.findOne({ slug: slugOrId });
    }

    if (!product) {
      return res.status(404).json({ message: 'Hardware component not found.' });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get related hardware recommendations
// @route   GET /api/v1/products/:id/related
exports.getRelatedProducts = async (req, res) => {
  try {
    const currentProduct = await Product.findById(req.params.id);

    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Find other products in same category or brand, excluding current product
    const related = await Product.find({
      _id: { $ne: currentProduct._id },
      $or: [
        { category: currentProduct.category },
        { brand: currentProduct.brand },
      ],
    })
      .sort({ rating: -1, stock: -1 })
      .limit(4);

    res.json(related);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product (Admin/Staff)
// @route   POST /api/v1/products
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update product (Admin/Staff)
// @route   PUT /api/v1/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Hardware component not found.' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete product (Admin/Staff)
// @route   DELETE /api/v1/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Hardware component not found.' });
    }
    res.json({ message: 'Component deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product review
// @route   POST /api/v1/products/:id/reviews
exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Hardware component not found.' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already submitted a review for this component.' });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
      user: req.user._id,
    };

    product.reviews.unshift(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({
      message: 'Review submitted successfully.',
      reviews: product.reviews,
      rating: product.rating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy toàn bộ đánh giá từ tất cả sản phẩm
// @route   GET /api/v1/products/reviews/all
exports.getAllReviews = async (req, res) => {
  try {
    const products = await Product.find({ 'reviews.0': { $exists: true } })
      .select('name slug images reviews')
      .lean();

    let allReviews = [];
    products.forEach((prod) => {
      prod.reviews.forEach((rev) => {
        allReviews.push({
          _id: rev._id,
          productId: prod._id,
          productName: prod.name,
          productSlug: prod.slug,
          productImage: prod.images?.[0] || '',
          name: rev.name,
          rating: rev.rating,
          comment: rev.comment,
          createdAt: rev.createdAt,
        });
      });
    });

    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(allReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa một đánh giá vi phạm và tự tính lại điểm trung bình
// @route   DELETE /api/v1/products/:productId/reviews/:reviewId
exports.deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== reviewId
    );

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.length > 0
        ? parseFloat(
            (
              product.reviews.reduce((acc, item) => item.rating + acc, 0) /
              product.reviews.length
            ).toFixed(1)
          )
        : 0;

    await product.save();
    res.json({ message: 'Review deleted successfully', rating: product.rating, numReviews: product.numReviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};