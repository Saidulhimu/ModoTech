import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUpload, FiX } from 'react-icons/fi';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const categories = ['AMP Zone', 'Power Hub', 'Desk Setup', 'Smart Life', 'Cable Core', 'Other'];

export default function AddProduct() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: 'AMP Zone',
    stock: '',
    isFeatured: false,
    imageUrls: [],
  });
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          setForm({
            name: data.name || '',
            description: data.description || '',
            price: data.price || '',
            discountPrice: data.discountPrice || '',
            category: data.category || 'AMP Zone',
            stock: data.stock || '',
            isFeatured: Boolean(data.isFeatured),
            imageUrls: data.imageUrls || [],
          });
          setPreviewImages(data.imageUrls || []);
        } catch {
          toast.error('Could not load product for editing');
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    // Local preview
    const previews = files.map((f) => URL.createObjectURL(f));
    setPreviewImages((prev) => [...prev, ...previews]);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...data.imageUrls] }));
      toast.success('Images uploaded!');
    } catch {
      toast.error('Image upload failed. Using URLs instead.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setForm((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.imageUrls.length === 0) {
      toast.error('Please add at least one product image.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        stock: Number(form.stock),
      };

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated successfully! 🎉', { style: { borderRadius: '12px' } });
      } else {
        await api.post('/products', payload);
        toast.success('Product added successfully! 🎉', { style: { borderRadius: '12px' } });
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-lg">Product Information</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all"
                placeholder="e.g. Pro Wireless Headphones"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all resize-none"
                placeholder="Describe the product features, specs..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Regular Price (৳) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. 2500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sale Price (৳) <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  name="discountPrice"
                  value={form.discountPrice}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all"
                  placeholder="Leave empty for no sale"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all bg-white"
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 accent-primary rounded"
              />
              <span className="font-semibold text-sm">Feature this product on the homepage</span>
            </label>
          </div>
        </div>

        {/* Images & Submit */}
        <div className="space-y-6">
          {/* Images */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Product Images *</h3>

            <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors">
              <FiUpload size={28} className="mx-auto text-gray-400 mb-2" />
              <span className="text-sm text-gray-500 font-medium">
                {uploading ? 'Uploading...' : 'Click to upload images'}
              </span>
              <span className="block text-xs text-gray-400 mt-1">JPG, PNG, WebP — Max 5MB each</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>

            {/* Manual URL input */}
            <div className="mt-4">
              <input
                type="url"
                placeholder="Or paste image URL and press Enter"
                className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const url = e.target.value.trim();
                    if (url) {
                      setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, url] }));
                      setPreviewImages((prev) => [...prev, url]);
                      e.target.value = '';
                    }
                  }
                }}
              />
            </div>

            {/* Previews */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {previewImages.map((src, i) => (
                  <div key={i} className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden group">
                    <img src={src} alt="" className="w-full h-full object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 rounded-xl">
            {loading ? (isEdit ? 'Updating Product...' : 'Saving Product...') : (isEdit ? 'Update Product' : 'Save Product')}
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="w-full text-center text-sm text-gray-500 hover:text-dark transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
