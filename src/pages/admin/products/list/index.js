import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaEdit,
  FaEyeSlash,
  FaPlus,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilter,
  FaSpinner,
  FaEye,
  FaImage,
  FaCheck,
  FaTimes,
  FaEllipsisV,
  FaTrashAlt
} from 'react-icons/fa';
import { fetchProducts } from '../../../../stores/redux/actions/adminActions.js';
import { APP_CONFIG } from '../../../../config/index.js';
import { useAuth } from '../../../../contexts/AuthContext.js';
import { ProductService } from '../../../../services/apiService';
import ProductDetailDialogAdmin from '../detail/index.js';
import EditProductDialog from '../update/index.js';

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();

  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [confirmHide, setConfirmHide] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State cho dialog chi tiết sản phẩm
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // State cho dialog chỉnh sửa sản phẩm
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  // Lấy dữ liệu từ Redux store
  const { products = [], loading = false, error = null } = useSelector((state) => {
    return state.adminReducer || {};
  });

  // Kiểm tra quyền admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/admin/products' } });
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch sản phẩm khi component mount hoặc các filter thay đổi
  useEffect(() => {
    const params = {};

    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }

    if (searchTerm) {
      params.search = searchTerm;
    }

    // Cấu hình sort
    params.sort = sortField;
    params.order = sortOrder;

    dispatch(fetchProducts(params));
  }, [dispatch, selectedCategory, searchTerm, sortField, sortOrder]);

  // Đóng action menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveActionMenu(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(e.target.search.value);
    setCurrentPage(1); // Reset về trang đầu khi tìm kiếm
  };

  // Xử lý thay đổi danh mục
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset về trang đầu khi thay đổi danh mục
  };

  // Xử lý sắp xếp
  const handleSort = (field) => {
    // Nếu click vào cùng field đang sort
    if (field === sortField) {
      // Đổi thứ tự sort
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Nếu sort theo field mới, default là desc
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Xử lý xem chi tiết sản phẩm
  const handleViewProduct = (productId, e) => {
    e.stopPropagation();
    setSelectedProductId(productId);
    setShowProductDetail(true);
    setActiveActionMenu(null); // Đóng menu hành động
  };

  // Xử lý chỉnh sửa sản phẩm
  const handleEditProduct = (productId, e) => {
    e.stopPropagation();
    setEditProductId(productId);
    setShowEditProduct(true);
    setActiveActionMenu(null); // Đóng menu hành động
  };

  // Xử lý đóng dialog chi tiết sản phẩm
  const handleCloseProductDetail = () => {
    setShowProductDetail(false);
    setSelectedProductId(null);
  };

  // Xử lý đóng dialog chỉnh sửa sản phẩm
  const handleCloseEditProduct = () => {
    setShowEditProduct(false);
    setEditProductId(null);
  };

  // Xử lý hoàn thành chỉnh sửa sản phẩm
  const handleProductUpdated = () => {
    // Cập nhật lại danh sách sản phẩm sau khi chỉnh sửa
    dispatch(fetchProducts({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchTerm || undefined,
      sort: sortField,
      order: sortOrder
    }));
    setShowEditProduct(false);
    setEditProductId(null);
  };

  // Xử lý sản phẩm bị ẩn
  const handleProductHidden = () => {
    // Cập nhật lại danh sách sản phẩm sau khi ẩn
    dispatch(fetchProducts({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchTerm || undefined,
      sort: sortField,
      order: sortOrder
    }));
  };

  // Xử lý ẩn sản phẩm
  const handleHideProduct = async (id, e) => {
    e.stopPropagation();
    if (confirmHide === id) {
      try {
        setIsProcessing(true);
        await ProductService.hideProduct(id);

        // Cập nhật lại danh sách sản phẩm sau khi ẩn
        dispatch(fetchProducts({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchTerm || undefined,
          sort: sortField,
          order: sortOrder
        }));

        setConfirmHide(null);
      } catch (error) {
        console.error('Failed to hide product:', error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setConfirmHide(id);
      // Tự động đóng hộp thoại xác nhận sau 3 giây
      setTimeout(() => {
        setConfirmHide(null);
      }, 3000);
    }
  };

  // Xử lý xóa sản phẩm
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirmDelete === id) {
      try {
        setIsDeleting(true);
        await ProductService.deleteProduct(id);

        // Cập nhật lại danh sách sản phẩm sau khi xóa
        dispatch(fetchProducts({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchTerm || undefined,
          sort: sortField,
          order: sortOrder
        }));

        setConfirmDelete(null);
      } catch (error) {
        console.error('Failed to delete product:', error);
      } finally {
        setIsDeleting(false);
      }
    } else {
      setConfirmDelete(id);
      // Tự động đóng hộp thoại xác nhận sau 3 giây
      setTimeout(() => {
        setConfirmDelete(null);
      }, 3000);
    }
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Thay đổi trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Hiển thị sort icon
  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-400" />;
    if (sortOrder === 'asc') return <FaSortUp className="ml-1 text-blue-600" />;
    return <FaSortDown className="ml-1 text-blue-600" />;
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortField('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Toggle menu hành động cho sản phẩm
  const toggleActionMenu = (productId, e) => {
    e.stopPropagation();
    setActiveActionMenu(activeActionMenu === productId ? null : productId);
  };

  // Hiển thị cập nhật thời gian cuối cùng nếu có
  const renderUpdatedTime = (product) => {
    if (!product.updatedAt) return null;

    const updatedDate = new Date(product.updatedAt);
    const formattedDate = updatedDate.toLocaleDateString('vi-VN');

    return (
      <div className="mt-1">
        <span className="text-xs italic text-gray-500">
          Cập nhật: {formattedDate}
        </span>
      </div>
    );
  };

  return (
    <div className="px-2 py-4">
      <div className="flex flex-col mb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <button
            onClick={() => navigate('/admin/add-products')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 text-sm rounded-lg flex items-center"
          >
            <FaPlus className="mr-1" />
            <span className="hidden sm:inline">Thêm sản phẩm mới</span>
            <span className="sm:hidden">Thêm</span>
          </button>
        </div>

        {/* Thanh tìm kiếm rút gọn */}
        <div className="bg-white shadow rounded-lg p-3 mb-3">
          <form onSubmit={handleSearch} className="flex mb-2">
            <input
              type="text"
              name="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full rounded-l-lg border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-r-lg px-3 py-2 hover:bg-blue-700"
            >
              <FaSearch />
            </button>
          </form>

          {/* Toggle filter button */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 text-sm flex items-center"
            >
              <FaFilter className="mr-1" />
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </button>

            {/* Active filter count */}
            {(searchTerm || selectedCategory !== 'all' || sortField !== 'createdAt' || sortOrder !== 'desc') && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {(searchTerm ? 1 : 0) +
                 (selectedCategory !== 'all' ? 1 : 0) +
                 ((sortField !== 'createdAt' || sortOrder !== 'desc') ? 1 : 0)} bộ lọc
              </span>
            )}
          </div>

          {/* Expandable filters section */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {/* Lọc theo danh mục */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Danh mục:</label>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Tất cả
                  </button>
                  {APP_CONFIG.PRODUCT_CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => handleCategoryChange(category.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCategory === category.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sắp xếp */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Sắp xếp theo:</label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => handleSort('name')}
                    className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
                      sortField === 'name' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                    }`}
                  >
                    Tên {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    onClick={() => handleSort('price')}
                    className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
                      sortField === 'price' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                    }`}
                  >
                    Giá {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    onClick={() => handleSort('stock')}
                    className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
                      sortField === 'stock' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                    }`}
                  >
                    Tồn kho {sortField === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    onClick={() => handleSort('createdAt')}
                    className={`px-2 py-1 text-xs rounded flex items-center justify-center ${
                      sortField === 'createdAt' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                    }`}
                  >
                    Ngày tạo {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                </div>
              </div>

              {/* Active filters & reset button */}
              {(searchTerm || selectedCategory !== 'all' || sortField !== 'createdAt' || sortOrder !== 'desc') && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {searchTerm && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                      Tìm: {searchTerm.length > 10 ? searchTerm.substring(0, 10) + '...' : searchTerm}
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1 text-blue-800"
                      >
                        &times;
                      </button>
                    </span>
                  )}
                  {selectedCategory !== 'all' && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                      {APP_CONFIG.PRODUCT_CATEGORIES.find(c => c.value === selectedCategory)?.label}
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="ml-1 text-blue-800"
                      >
                        &times;
                      </button>
                    </span>
                  )}
                  <button
                    onClick={resetFilters}
                    className="ml-auto text-blue-600 text-xs underline"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị lỗi */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded-r text-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaTimes className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-2">
              <p className="text-red-700">{error.message || 'Đã xảy ra lỗi khi tải dữ liệu sản phẩm.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hiển thị loading */}
      {loading && (
        <div className="flex justify-center items-center py-6">
          <FaSpinner className="animate-spin text-blue-600 h-6 w-6" />
          <span className="ml-2 text-gray-600 text-sm">Đang tải...</span>
        </div>
      )}

      {/* Danh sách sản phẩm kiểu card cho mobile */}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sản phẩm nào</h3>
              <p className="mt-1 text-xs text-gray-500">
                Bắt đầu bằng cách thêm sản phẩm mới.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/admin/add-products')}
                >
                  <FaPlus className="mr-1 h-4 w-4" />
                  Thêm sản phẩm mới
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {currentItems.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                  onClick={(e) => handleEditProduct(product._id, e)} // Mở dialog chỉnh sửa khi nhấp vào sản phẩm
                >
                  <div className="flex p-3 items-center">
                    {/* Hình ảnh */}
                    <div className="w-16 h-16 rounded-lg mr-3 bg-gray-100 overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaImage className="text-gray-400 text-xl" />
                        </div>
                      )}
                    </div>

                    {/* Thông tin sản phẩm */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                          {APP_CONFIG.PRODUCT_CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                        </span>
                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center">
                        <span className="text-xs text-gray-500">
                          {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="mx-1 text-gray-300">•</span>
                        {product.category === 'spa' ? (
                          <span className="text-xs text-gray-500">N/A</span>
                        ) : product.stock <= 0 ? (
                          <span className="text-xs text-red-600 font-medium">Hết hàng</span>
                        ) : product.stock < 10 ? (
                          <span className="text-xs text-yellow-600 font-medium">{product.stock} - Sắp hết</span>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">{product.stock} sp</span>
                        )}
                        {product.featured && (
                          <>
                            <span className="mx-1 text-gray-300">•</span>
                            <span className="text-xs text-yellow-600 font-medium flex items-center">
                              <FaCheck className="mr-0.5 h-2.5 w-2.5" />
                              Nổi bật
                            </span>
                          </>
                        )}
                      </div>
                      {renderUpdatedTime(product)}
                    </div>

                    {/* Menu thao tác */}
                    <div className="relative">
                      <button
                        onClick={(e) => toggleActionMenu(product._id, e)}
                        className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100"
                      >
                        <FaEllipsisV size={14} />
                      </button>

                      {activeActionMenu === product._id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-md shadow-lg z-10 py-1">
                          <button
                            onClick={(e) => handleViewProduct(product._id, e)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <FaEye className="mr-2 text-blue-500" />
                            Xem
                          </button>
                          <button
                            onClick={(e) => handleEditProduct(product._id, e)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <FaEdit className="mr-2 text-indigo-500" />
                            Sửa
                          </button>
                          <button
                            onClick={(e) => handleHideProduct(product._id, e)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center ${
                              confirmHide === product._id ? 'text-red-700 font-medium bg-red-50' : 'text-gray-700'
                            }`}
                          >
                            {isProcessing && confirmHide === product._id ? (
                              <FaSpinner className="animate-spin mr-2 text-red-500" />
                            ) : (
                              <FaEyeSlash className="mr-2 text-red-500" />
                            )}
                            {confirmHide === product._id ? 'Xác nhận ẩn?' : 'Ẩn'}
                          </button>
                          <button
                            onClick={(e) => handleDelete(product._id, e)}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center ${
                              confirmDelete === product._id ? 'text-red-700 font-medium bg-red-50' : 'text-gray-700'
                            }`}
                          >
                            {isDeleting && confirmDelete === product._id ? (
                              <FaSpinner className="animate-spin mr-2 text-red-500" />
                            ) : (
                              <FaTrashAlt className="mr-2 text-red-500" />
                            )}
                            {confirmDelete === product._id ? 'Xác nhận xóa?' : 'Xóa'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Phân trang đơn giản hóa cho mobile */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    Trước
                  </button>

                  <div className="text-sm text-gray-600">
                    Trang {currentPage}/{totalPages}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Dialog chi tiết sản phẩm */}
      {showProductDetail && selectedProductId && (
        <ProductDetailDialogAdmin
          productId={selectedProductId}
          onClose={handleCloseProductDetail}
          onProductHidden={handleProductHidden}
        />
      )}

      {/* Dialog chỉnh sửa sản phẩm */}
      {showEditProduct && editProductId && (
        <EditProductDialog
          productId={editProductId}
          onClose={handleCloseEditProduct}
          onProductUpdated={handleProductUpdated}
        />
      )}

    </div>
  );
};

export default AdminProductsPage;