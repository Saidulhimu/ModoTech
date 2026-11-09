import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(verifyAdmin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(verifyAdmin, updateProduct)
  .delete(verifyAdmin, deleteProduct);

export default router;
