import Product from '../models/Product.js';
import { initialProducts } from '../seedData.js';
import { isDBConnected } from '../config/db.js';

// In-memory products store for instant fallback whenever MongoDB is not running locally
let memoryProducts = [...initialProducts].map((p, idx) => ({
  ...p,
  _id: p._id || `p_${Date.now()}_${idx}`,
  createdAt: new Date(),
}));

/**
 * @desc   Get all products with filtering, search & pagination
 * @route  GET /api/products
 * @access Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search, featured, page = 1, limit = 12 } = req.query;

    if (isDBConnected()) {
      const filter = {};
      if (category && category !== 'All') filter.category = category;
      if (featured === 'true') filter.isFeatured = true;
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const total = await Product.countDocuments(filter);
      const products = await Product.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });

      return res.json({
        success: true,
        products,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        total,
      });
    }

    // Instant Zero-Delay In-Memory Handler (< 1ms)
    let filtered = [...memoryProducts];

    if (category && category !== 'All') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (featured === 'true') {
      filtered = filtered.filter((p) => p.isFeatured);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    if (minPrice) {
      filtered = filtered.filter((p) => (p.discountPrice || p.price) >= Number(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter((p) => (p.discountPrice || p.price) <= Number(maxPrice));
    }

    const total = filtered.length;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = filtered.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      products: paginatedProducts,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single product by ID
 * @route  GET /api/products/:id
 * @access Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json(product);
    }

    // Fallback to memory
    const product = memoryProducts.find((p) => String(p._id) === String(id));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create new product
 * @route  POST /api/products
 * @access Private (Admin)
 */
export const createProduct = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      const product = new Product(req.body);
      const saved = await product.save();
      return res.status(201).json(saved);
    }

    const newProduct = {
      ...req.body,
      _id: `p_${Date.now()}`,
      createdAt: new Date(),
    };
    memoryProducts.unshift(newProduct);
    return res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update existing product
 * @route  PUT /api/products/:id
 * @access Private (Admin)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json(updated);
    }

    const index = memoryProducts.findIndex((p) => String(p._id) === String(id));
    if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

    memoryProducts[index] = { ...memoryProducts[index], ...req.body };
    return res.json(memoryProducts[index]);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete product
 * @route  DELETE /api/products/:id
 * @access Private (Admin)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, message: 'Product deleted successfully' });
    }

    const index = memoryProducts.findIndex((p) => String(p._id) === String(id));
    if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

    memoryProducts.splice(index, 1);
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

