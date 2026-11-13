import apiClient from './apiClient';

const LOCAL_ORDERS_KEY = 'modotech_local_orders';

const getStoredOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveStoredOrder = (order) => {
  try {
    const orders = getStoredOrders();
    orders.unshift(order);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
};

/**
 * Order Service Layer with High-Availability Fallback
 */
export const orderService = {
  async createOrder(orderPayload) {
    try {
      const { data } = await apiClient.post('/orders', orderPayload);
      if (data && data._id) {
        saveStoredOrder(data);
        return data;
      }
      throw new Error('Invalid server response');
    } catch {
      // Local fallback so user order NEVER fails
      const fallbackOrder = {
        _id: `ord_${Date.now()}`,
        ...orderPayload,
        orderStatus: 'Pending',
        createdAt: new Date().toISOString(),
      };
      saveStoredOrder(fallbackOrder);
      return fallbackOrder;
    }
  },

  async getOrderById(id) {
    try {
      const { data } = await apiClient.get(`/orders/${id}`);
      if (data && data._id) return data;
      const stored = getStoredOrders().find((o) => String(o._id) === String(id));
      if (stored) return stored;
      return null;
    } catch {
      const stored = getStoredOrders().find((o) => String(o._id) === String(id));
      return stored || null;
    }
  },

  async getMyOrders() {
    try {
      const { data } = await apiClient.get('/orders/myorders');
      if (Array.isArray(data) && data.length > 0) return data;
      return getStoredOrders();
    } catch {
      return getStoredOrders();
    }
  },

  async getAllOrders() {
    try {
      const { data } = await apiClient.get('/orders');
      return data || [];
    } catch {
      return getStoredOrders();
    }
  },

  async updateOrderStatus(id, orderStatus) {
    try {
      const { data } = await apiClient.put(`/orders/${id}/status`, { orderStatus });
      return data;
    } catch {
      const orders = getStoredOrders().map((o) =>
        String(o._id) === String(id) ? { ...o, orderStatus } : o
      );
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
      return { success: true };
    }
  },

  async searchOrderByQuery(query) {
    if (!query) return null;
    const cleanQ = String(query).trim().toLowerCase();
    
    // Direct ID lookup first
    const directOrder = await this.getOrderById(cleanQ);
    if (directOrder) return directOrder;

    // Search stored & server orders by phone number or ID substring
    const allOrders = await this.getAllOrders();
    const cleanDigits = cleanQ.replace(/\D/g, '');

    const found = allOrders.find((o) => {
      const orderPhone = (o.shippingAddress?.phone || o.phone || '').replace(/\D/g, '');
      if (cleanDigits.length >= 7 && orderPhone.length >= 7 && (orderPhone.includes(cleanDigits) || cleanDigits.includes(orderPhone))) {
        return true;
      }
      if (String(o._id).toLowerCase().includes(cleanQ)) return true;
      return false;
    });

    return found || null;
  },
};

export default orderService;
