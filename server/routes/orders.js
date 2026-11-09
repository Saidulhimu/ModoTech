import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

router.route('/')
  .post(createOrder)
  .get(verifyAdmin, getAllOrders);

router.route('/myorders')
  .get(verifyToken, getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .put(verifyAdmin, updateOrderStatus);

export default router;
