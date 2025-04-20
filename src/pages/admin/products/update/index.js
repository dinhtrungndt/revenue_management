import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaTimes, FaSave, FaUpload, FaSpinner, FaTag, FaLayerGroup,
  FaDollarSign, FaPencilAlt, FaWeightHanging, FaBoxOpen,
  FaStar, FaCamera, FaArrowLeft, FaTrash
} from 'react-icons/fa';
import { useAuth } from '../../../../contexts/AuthContext';
import { APP_CONFIG } from '../../../../config';
import { ProductService } from '../../../../services/apiService';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // State cho form
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    weight: '',
    stock: '',
    featured: false,
  });

  const [originalImage, setOriginalImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [deleteImageMode, setDeleteImageMode] = useState(false);

  // Kiểm tra quyền admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login', { state: { from: `/admin/products/edit/${id}` } });
    }
  }, [isAuthenticated, user, navigate, id]);

  // Lấy thông tin sản phẩm để chỉnh sửa
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setFetchLoading(true);
        setError(null);

        const response = await ProductService.getProductById(id);
        const product = response;

        setFormData({
          name: product.name || '',
          category: product.category || 'dog',
          price: product.price || '',
          description: product.description || '',
          weight: product.weight || '',
          stock: product.stock || '',
          featured: product.featured || false,
        });

        if (product.image) {
          setOriginalImage(product.image);
          setPreviewImage(product.image);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin sản phẩm');
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Cập nhật state khi thay đổi danh mục
    if (name === 'category') {
      const isSpa = value === 'spa';
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        // Nếu chuyển sang loại spa, cập nhật các trường theo yêu cầu
        weight: isSpa ? 'N/A' : prev.weight,
        stock: isSpa ? 999 : prev.stock,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  // Xử lý chọn file ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setDeleteImageMode(false);
    }
  };

  // Xử lý xóa ảnh
  const handleRemoveImage = () => {
    setDeleteImageMode(true);
    setNewImage(null);
    setPreviewImage(null);
  };

  // Xử lý khôi phục ảnh
  const handleRestoreImage = () => {
    setDeleteImageMode(false);
    setNewImage(null);
    setPreviewImage(originalImage);
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('price', parseFloat(formData.price));
      data.append('description', formData.description);

      if (formData.category !== 'spa') {
        data.append('weight', formData.weight);
        data.append('stock', parseInt(formData.stock));
      }

      data.append('featured', formData.featured);

      // Xử lý ảnh
      if (newImage) {
        data.append('image', newImage);
      } else if (deleteImageMode) {
        data.append('deleteImage', true);
      }

      await ProductService.updateProduct(id, data);
      setSuccess(true);

      // Quay lại danh sách sản phẩm sau 1.5 giây
      setTimeout(() => {
        navigate('/admin/list-products');
      }, 1500);

    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật sản phẩm');
      setLoading(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FaSpinner className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
          <p className="mt-2 text-sm text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {/* Nút quay lại */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate('/admin/list-products')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaArrowLeft className="mr-2 -ml-1 h-4 w-4" />
            Quay lại danh sách
          </button>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md animate-pulse">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-500 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Lỗi!</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Thông báo thành công */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md animate-pulse">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-green-800">Thành công!</h3>
                <p className="text-sm text-green-700 mt-1">Cập nhật sản phẩm thành công!</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl overflow-hidden"
        >
          {/* Form header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-center">
            <FaPencilAlt className="mr-2 text-white text-lg" />
            <h2 className="text-lg font-medium">Chỉnh sửa sản phẩm</h2>
          </div>

          <div className="p-5 space-y-5">
            {/* Tên sản phẩm */}
            <div className="form-group">
              <label
                htmlFor="name"
                className="flex items-center text-sm font-medium text-gray-700 mb-2"
              >
                <FaTag className="mr-2 text-blue-500" />
                Tên sản phẩm
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>

            {/* Danh mục */}
            <div className="form-group">
              <label
                htmlFor="category"
                className="flex items-center text-sm font-medium text-gray-700 mb-2"
              >
                <FaLayerGroup className="mr-2 text-blue-500" />
                Danh mục
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 appearance-none"
                  required
                >
                  {APP_CONFIG.PRODUCT_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Giá */}
            <div className="form-group">
              <label
                htmlFor="price"
                className="flex items-center text-sm font-medium text-gray-700 mb-2"
              >
                <FaDollarSign className="mr-2 text-blue-500" />
                Giá (VND)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                  placeholder="Nhập giá sản phẩm"
                  required
                />
                {formData.price && (
                  <div className="mt-1 text-right text-xs text-blue-600 font-medium">
                    {formatPrice(formData.price)}
                  </div>
                )}
              </div>
            </div>

            {/* Mô tả */}
            <div className="form-group">
              <label
                htmlFor="description"
                className="flex items-center text-sm font-medium text-gray-700 mb-2"
              >
                <FaPencilAlt className="mr-2 text-blue-500" />
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 resize-none"
                placeholder="Mô tả chi tiết về sản phẩm"
                required
              />
            </div>

            {/* Cân nặng */}
            {formData.category !== 'spa' && (
              <div className="form-group">
                <label
                  htmlFor="weight"
                  className="flex items-center text-sm font-medium text-gray-700 mb-2"
                >
                  <FaWeightHanging className="mr-2 text-blue-500" />
                  Cân nặng
                </label>
                <input
                  type="text"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                  placeholder="VD: 2-3kg, 300g, 1.5kg,..."
                  required
                />
              </div>
            )}

            {/* Số lượng tồn kho */}
            {formData.category !== 'spa' && (
              <div className="form-group">
                <label
                  htmlFor="stock"
                  className="flex items-center text-sm font-medium text-gray-700 mb-2"
                >
                  <FaBoxOpen className="mr-2 text-blue-500" />
                  Số lượng tồn kho
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                  placeholder="Nhập số lượng tồn kho"
                  required
                />
              </div>
            )}

            {/* Nổi bật */}
            <div className="form-group">
              <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="featured"
                  className="ml-3 flex items-center text-sm text-gray-700"
                >
                  <FaStar className="mr-2 text-yellow-500" />
                  Đánh dấu là sản phẩm nổi bật
                </label>
              </div>
            </div>

            {/* Upload ảnh */}
            <div className="form-group">
              <label
                htmlFor="image"
                className="flex items-center text-sm font-medium text-gray-700 mb-2"
              >
                <FaCamera className="mr-2 text-blue-500" />
                Hình ảnh sản phẩm
              </label>

              {!previewImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-all duration-200"
                  onClick={() => document.getElementById('image').click()}>
                  <FaUpload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Nhấp để chọn ảnh hoặc kéo thả vào đây</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                  {deleteImageMode && originalImage && (
                    <button
                      type="button"
                      onClick={handleRestoreImage}
                      className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Khôi phục ảnh cũ
                    </button>
                  )}
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </div>
              ) : (
                <div className="relative border rounded-lg overflow-hidden">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black bg-opacity-60 text-white p-2 text-sm truncate">
                    {newImage ? newImage.name : 'Ảnh hiện tại'}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Nút điều khiển */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
            >
              <FaTimes className="mr-2 h-4 w-4" />
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <FaSave className="mr-2 h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Pet Shop Admin System
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;