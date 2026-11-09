import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['AMP Zone', 'Cable Core', 'Smart Hold', 'Smart Shells', 'Other'],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    imageUrls: {
      type: [String],
      required: [true, 'At least one image is required'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Virtual: check if on sale
productSchema.virtual('onSale').get(function () {
  return this.discountPrice !== null && this.discountPrice < this.price;
});

export default mongoose.model('Product', productSchema);

