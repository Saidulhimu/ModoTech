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
      addToCart: (product, quantity = 1, openDrawerImmediately = true, selectedColor = null) => {
        if (!product) return;

        const safePrice = Number(product.price) || 0;
        const safeDiscount =
          product.discountPrice !== null &&
          product.discountPrice !== undefined &&
          product.discountPrice !== ''
            ? Number(product.discountPrice)
            : null;

        const safeImages =
          Array.isArray(product.imageUrls) && product.imageUrls.length > 0 && product.imageUrls[0]
            ? product.imageUrls
            : product.imageUrl
            ? [product.imageUrl]
            : product.image
            ? [product.image]
            : ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'];

        const colorName =
          typeof selectedColor === 'object' && selectedColor !== null
            ? selectedColor.name
            : selectedColor || product.selectedColor || null;

        const baseId = String(product._id || `item_${Date.now()}`);
        const cartId = colorName ? `${baseId}__${colorName}` : baseId;

        const sanitized = {
          ...product,
          _id: baseId,
          cartId,
          selectedColor: colorName,
          name: product.name || 'Tech Gadget',
          price: safePrice,
          discountPrice: safeDiscount,
          imageUrls: safeImages,
        };

        const qty = Math.max(1, Number(quantity) || 1);
        const currentItems = Array.isArray(get().items) ? get().items : [];
        const existingIndex = currentItems.findIndex(
          (item) => (item.cartId || item._id) === cartId
        );

        if (existingIndex >= 0) {
          const updatedItems = [...currentItems];
          const prevQty = Number(updatedItems[existingIndex].quantity) || 1;
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            ...sanitized,
            quantity: prevQty + qty,
          };
          set({ items: updatedItems });
        } else {
          set({ items: [...currentItems, { ...sanitized, quantity: qty }] });
        }

        if (openDrawerImmediately) {
          set({ isDrawerOpen: true });
        }
      },

      removeFromCart: (cartIdOrProductId) => {
        const targetId = String(cartIdOrProductId);
        const currentItems = Array.isArray(get().items) ? get().items : [];
        set({
          items: currentItems.filter(
            (item) => String(item.cartId || item._id) !== targetId && String(item._id) !== targetId
          ),
        });
      },

      updateQuantity: (cartIdOrProductId, quantity) => {
        const qty = Number(quantity);
        if (isNaN(qty) || qty < 1) return;
        const targetId = String(cartIdOrProductId);
        const currentItems = Array.isArray(get().items) ? get().items : [];
        set({
          items: currentItems.map((item) =>
            String(item.cartId || item._id) === targetId || String(item._id) === targetId
              ? { ...item, quantity: qty }
              : item
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

      // Calculations (Strict numeric sanitation preventing NaN errors)
      getTotalItems: () => {
        const items = Array.isArray(get().items) ? get().items : [];
        return items.reduce((acc, item) => acc + (Number(item?.quantity) || 1), 0);
      },

      getTotalPrice: () => {
        const items = Array.isArray(get().items) ? get().items : [];
        return items.reduce((acc, item) => {
          const rawPrice =
            item?.discountPrice !== null &&
            item?.discountPrice !== undefined &&
            item?.discountPrice !== ''
              ? Number(item.discountPrice)
              : Number(item?.price);
          const price = isNaN(rawPrice) ? 0 : rawPrice;
          const qty = Number(item?.quantity) || 1;
          return acc + price * qty;
        }, 0);
      },

      // Shipping calculation (Inside Dhaka: ৳60, Outside: ৳120; Free if total >= 2000 or FREESHIP coupon)
      getShippingFee: () => {
        const subtotal = get().getTotalPrice();
        if (subtotal <= 0) return 0;
        if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
        if (get().coupon?.code === 'FREESHIP') return 0;
        return get().shippingArea === 'outside_dhaka' ? 120 : 60;
      },

      // Coupon discount calculation
      getDiscountAmount: () => {
        const subtotal = get().getTotalPrice();
        const coupon = get().coupon;
        if (!coupon || subtotal <= 0) return 0;

        if (coupon.type === 'percentage') {
          return Math.round((subtotal * (Number(coupon.value) || 0)) / 100);
        }
        if (coupon.type === 'fixed') {
          return Math.min(Number(coupon.value) || 0, subtotal);
        }
        return 0; // free_shipping reduces shipping fee, not subtotal
      },

      // Final Grand Total
      getFinalTotal: () => {
        const subtotal = get().getTotalPrice();
        if (subtotal <= 0) return 0;
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
