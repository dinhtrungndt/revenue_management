import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch, FaExclamationTriangle, FaBoxOpen, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { fetchInventoryReport } from '../../stores/redux/actions/adminActions.js';
import { ProductService } from '../../services/apiService';
import { toast } from 'react-toastify';

const InventoryReport = () => {
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector((state) => state.adminReducer);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showHiddenProducts, setShowHiddenProducts] = useState(false);
  const [hiddenProducts, setHiddenProducts] = useState([]);
  const [isLoadingHidden, setIsLoadingHidden] = useState(false);
  const [isRestoring, setIsRestoring] = useState(null);

  useEffect(() => {
    // Fetch active products
    dispatch(fetchInventoryReport({
      category: filterCategory !== 'all' ? filterCategory : undefined,
      isActive: true // Chỉ lấy sản phẩm active
    }));
  }, [dispatch, filterCategory]);

  // Fetch hidden products when toggle is on
  useEffect(() => {
    if (showHiddenProducts) {
      fetchHiddenProducts();
    }
  }, [showHiddenProducts]);

  const fetchHiddenProducts = async () => {
    try {
      setIsLoadingHidden(true);
      const response = await ProductService.getHiddenProducts();
      setHiddenProducts(response || []);
    } catch (error) {
      console.error('Error fetching hidden products:', error);
      toast.error('Không thể tải sản phẩm đã ẩn');
    } finally {
      setIsLoadingHidden(false);
    }
  };

  const handleRestoreProduct = async (productId) => {
    try {
      setIsRestoring(productId);
      await ProductService.restoreProduct(productId);

      // Refresh data
      fetchHiddenProducts();
      dispatch(fetchInventoryReport({ category: filterCategory !== 'all' ? filterCategory : undefined }));

      toast.success('Đã khôi phục sản phẩm thành công');
    } catch (error) {
      console.error('Error restoring product:', error);
      toast.error('Không thể khôi phục sản phẩm');
    } finally {
      setIsRestoring(null);
    }
  };

  const inventoryReport = reports.inventory || {
    products: [],
    summary: {
      totalProducts: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    },
    categoryStats: {},
  };

  // Lọc sản phẩm theo từ khóa tìm kiếm và đảm bảo chỉ hiển thị sản phẩm KHÔNG bị ẩn
  const filteredProducts = inventoryReport.products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    product.isActive !== false // Chỉ lấy sản phẩm active
  );

  // Lọc sản phẩm đã ẩn theo từ khóa tìm kiếm
  const filteredHiddenProducts = hiddenProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Định dạng tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading && !showHiddenProducts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-500">
          <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p className="font-bold">Lỗi</p>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <FaBoxOpen className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng số sản phẩm</p>
              <p className="text-lg font-semibold">{inventoryReport.summary.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-3">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng giá trị tồn kho</p>
              <p className="text-lg font-semibold">{formatCurrency(inventoryReport.summary.totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-3">
              <FaExclamationTriangle className="text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sắp hết hàng</p>
              <p className="text-lg font-semibold">{inventoryReport.summary.lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-3">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hết hàng</p>
              <p className="text-lg font-semibold">{inventoryReport.summary.outOfStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Thống kê theo danh mục</h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng sản phẩm
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tồn kho
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(inventoryReport.categoryStats).map(([category, stats]) => (
                  <tr key={category}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {category === 'dog' ? 'Chó' : 'Mèo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(stats.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-lg font-semibold">Danh sách sản phẩm tồn kho</h2>

          <div className="flex flex-wrap space-x-2 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <FaSearch className="text-gray-400" />
              </div>
            </div>

            <select
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="dog">Chó</option>
              <option value="cat">Mèo</option>
            </select>

            {/* Toggle button to show hidden products */}
            <button
              onClick={() => setShowHiddenProducts(!showHiddenProducts)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                showHiddenProducts
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showHiddenProducts ? <FaEye className="mr-1" /> : <FaEyeSlash className="mr-1" />}
              {showHiddenProducts ? 'Đang hiện sản phẩm ẩn' : 'Hiện sản phẩm đã ẩn'}
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Mobile view - card style */}
          <div className="block md:hidden">
            {showHiddenProducts ? (
              isLoadingHidden ? (
                <div className="flex justify-center items-center py-6">
                  <FaSpinner className="animate-spin text-blue-600 h-6 w-6" />
                  <span className="ml-2 text-gray-600">Đang tải...</span>
                </div>
              ) : filteredHiddenProducts.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  Không có sản phẩm đã ẩn
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHiddenProducts.map((product) => (
                    <div key={product._id} className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                              {product.category === 'dog' ? 'Chó' : 'Mèo'}
                            </span>
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Tồn kho: <span className="font-medium">{product.stock}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Giá trị: <span className="font-medium">{formatCurrency(product.price * product.stock)}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleRestoreProduct(product._id)}
                          disabled={isRestoring === product._id}
                          className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200"
                        >
                          {isRestoring === product._id ? (
                            <FaSpinner className="animate-spin h-4 w-4" />
                          ) : (
                            <FaEye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Không tìm thấy sản phẩm nào
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product._id} className="bg-white border border-gray-200 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                          {product.category === 'dog' ? 'Chó' : 'Mèo'}
                        </span>
                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Tồn kho: <span className="font-medium">{product.stock}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Giá trị: <span className="font-medium">{formatCurrency(product.price * product.stock)}</span>
                      </p>
                      <div className="mt-2">
                        {product.stock === 0 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Hết hàng
                          </span>
                        ) : product.stock < 10 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Sắp hết
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Còn hàng
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Desktop view - table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  {showHiddenProducts && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {showHiddenProducts ? (
                  isLoadingHidden ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <div className="flex justify-center items-center">
                          <FaSpinner className="animate-spin text-blue-600 h-5 w-5 mr-2" />
                          Đang tải...
                        </div>
                      </td>
                    </tr>
                  ) : filteredHiddenProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Không có sản phẩm đã ẩn
                      </td>
                    </tr>
                  ) : (
                    filteredHiddenProducts.map((product) => (
                      <tr key={product._id} className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.category === 'dog' ? 'Chó' : 'Mèo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(product.price * product.stock)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Đã ẩn
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleRestoreProduct(product._id)}
                            disabled={isRestoring === product._id}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            {isRestoring === product._id ? (
                              <FaSpinner className="animate-spin h-5 w-5 mr-1" />
                            ) : (
                              <FaEye className="h-5 w-5 mr-1" />
                            )}
                            <span>Khôi phục</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category === 'dog' ? 'Chó' : 'Mèo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(product.price * product.stock)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.stock === 0 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Hết hàng
                          </span>
                        ) : product.stock < 10 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Sắp hết
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Còn hàng
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;