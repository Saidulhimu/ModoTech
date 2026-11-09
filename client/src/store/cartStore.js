import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Available coupon codes configuration
export const AVAILABLE_COUPONS = {
  WELCOME10: {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrder: 0,
    description: '10% off entire order for all tech items',
  },
  FREESHIP: {
    code: 'FREESHIP',
    type: 'free_shipping',
    value: 0,
    minOrder: 0,
    description: 'Free Delivery anywhere across Bangladesh',
  },
  MODO500: {
    code: 'MODO500',
    type: 'fixed',
    value: 500,
    minOrder: 3000,
    description: '৳500 flat discount on orders over ৳3,000',
  },
  TECHLOVER: {
    code: 'TECHLOVER',
    type: 'percentage',
    value: 15,
    minOrder: 5000,
    description: '15% mega discount on orders over ৳5,000',
  },
};

export const FREE_SHIPPING_THRESHOLD = 2000;

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      coupon: null,
      shippingArea: 'inside_dhaka', // 'inside_dhaka' | 'outside_dhaka'
      deliveryNote: '',

      // Drawer controls
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      // Cart operations
      addToCart: (product, quantity = 1, openDrawerImmediately = true) => {
        const existing = get().items.find((item) => item._id === product._id);
        if (existing) {
          set({
            items: get().items.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...get().items, { ...product, quantity }] });
        }
        if (openDrawerImmediately) {
          set({ isDrawerOpen: true });
        }
      },

      removeFromCart: (productId) => {
        set({ items: get().items.filter((item) => item._id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item._id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [], coupon: null }),

      // Delivery area & notes
      setShippingArea: (area) => set({ shippingArea: area }),
      setDeliveryNote: (note) => set({ deliveryNote: note }),

      // Coupon application
      applyCoupon: (rawCode) => {
        const cleanCode = (rawCode || '').trim().toUpperCase();
        if (!cleanCode) {
          return { success: false, message: 'Please enter a coupon code' };
        }
        const couponData = AVAILABLE_COUPONS[cleanCode];
        if (!couponData) {
          return {
            success: false,
            message: `Coupon "${cleanCode}" is invalid. Try WELCOME10 or FREESHIP!`,
          };
        }

        const subtotal = get().getTotalPrice();
        if (couponData.minOrder > 0 && subtotal < couponData.minOrder) {
          return {
            success: false,
            message: `Minimum order of ৳${couponData.minOrder.toLocaleString()} required for this coupon`,
          };
        }

        set({ coupon: couponData });
        return {
          success: true,
          message: `Coupon "${cleanCode}" applied! ${couponData.description}`,
          coupon: couponData,
        };
      },

      removeCoupon: () => {
        set({ coupon: null });
      },

      // Calculations
      getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (acc, item) =>
            acc + (item.discountPrice || item.price) * item.quantity,
          0
        ),

      // Shipping calculation (Inside Dhaka: ৳60, Outside: ৳120; Free if total >= 2000 or FREESHIP coupon)
      getShippingFee: () => {
        const subtotal = get().getTotalPrice();
        if (subtotal === 0) return 0;
        if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
        if (get().coupon?.code === 'FREESHIP') return 0;
        return get().shippingArea === 'outside_dhaka' ? 120 : 60;
      },

      // Coupon discount calculation
      getDiscountAmount: () => {
        const subtotal = get().getTotalPrice();
        const coupon = get().coupon;
        if (!coupon || subtotal === 0) return 0;

        if (coupon.type === 'percentage') {
          return Math.round((subtotal * coupon.value) / 100);
        }
        if (coupon.type === 'fixed') {
          return Math.min(coupon.value, subtotal);
        }
        return 0; // free_shipping reduces shipping fee, not subtotal
      },

      // Final Grand Total
      getFinalTotal: () => {
        const subtotal = get().getTotalPrice();
        if (subtotal === 0) return 0;
        const discount = get().getDiscountAmount();
        const shipping = get().getShippingFee();
        return Math.max(0, subtotal - discount + shipping);
      },
    }),
    {
      name: 'modotech-cart',
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
        shippingArea: state.shippingArea,
        deliveryNote: state.deliveryNote,
      }),
    }
  )
);
