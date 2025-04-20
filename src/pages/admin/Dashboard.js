import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {FaBoxes, FaShoppingCart, FaMoneyBillWave } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { fetchReportDashboard } from '../../stores/redux/actions/adminActions.js';
import { MdOutlineProductionQuantityLimits } from 'react-icons/md';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector((state) => state.adminReducer);

  useEffect(() => {
    dispatch(fetchReportDashboard());
  }, [dispatch]);

  // Định dạng tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) {
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

  const dashboard = reports.dashboard || {
    orders: { total: 0, recent: 0 },
    revenue: { total: 0, recent: 0 },
    inventory: { totalProducts: 0, totalStock: 0, totalValue: 0 },
    topProducts: [],
  };

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Tổng đơn hàng */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <FaShoppingCart className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Tổng đơn hàng</h3>
              <div className="mt-1 text-3xl font-semibold text-gray-700">
                {dashboard.orders.total}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                <span className="text-green-600 font-medium">+{dashboard.orders.recent}</span> đơn trong 30 ngày qua
              </p>
            </div>
          </div>
        </div>

        {/* Tổng doanh thu */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <FaMoneyBillWave className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Tổng doanh thu</h3>
              <div className="mt-1 text-3xl font-semibold text-gray-700">
                {formatCurrency(dashboard.revenue.total)}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                <span className="text-green-600 font-medium">{formatCurrency(dashboard.revenue.recent)}</span> trong 30 ngày qua
              </p>
            </div>
          </div>
        </div>

        {/* Tổng sản phẩm */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <FaBoxes className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Tổng sản phẩm</h3>
              <div className="mt-1 text-3xl font-semibold text-gray-700">
                {dashboard.inventory.totalProducts}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                <span className="text-blue-600 font-medium">{dashboard.inventory.totalStock}</span> đơn vị tồn kho
              </p>
            </div>
          </div>
        </div>

        {/* Giá trị tồn kho */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Giá trị tồn kho</h3>
              <div className="mt-1 text-3xl font-semibold text-gray-700">
                {formatCurrency(dashboard.inventory.totalValue)}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Cập nhật mới nhất
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Báo cáo nhanh */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Báo cáo nhanh</h2>
            <div className="flex space-x-2">
              <Link to="/admin/inventory" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col space-y-4">
              <Link to="/admin/inventory" className="bg-blue-50 p-4 rounded-lg flex items-center justify-between hover:bg-blue-100">
                <div className="flex items-center">
                  <FaBoxes className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-800 font-medium">Báo cáo hàng tồn kho</span>
                </div>
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>

              <Link to="/admin/export" className="bg-green-50 p-4 rounded-lg flex items-center justify-between hover:bg-green-100">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                  <span className="text-gray-800 font-medium">Báo cáo hàng xuất kho</span>
                </div>
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>

              <Link to="/admin/revenue" className="bg-yellow-50 p-4 rounded-lg flex items-center justify-between hover:bg-yellow-100">
                <div className="flex items-center">
                  <FaMoneyBillWave className="h-5 w-5 text-yellow-600 mr-3" />
                  <span className="text-gray-800 font-medium">Báo cáo doanh thu</span>
                </div>
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/admin/list-products" className="bg-purple-50 p-4 rounded-lg flex items-center justify-between hover:bg-purple-100">
                <div className="flex items-center">
                  <MdOutlineProductionQuantityLimits className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-gray-800 font-medium">Sản phẩm</span>
                  </div>
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Top sản phẩm bán chạy */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Top sản phẩm bán chạy</h2>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200">
              {dashboard.topProducts && dashboard.topProducts.length > 0 ? (
                dashboard.topProducts.map((product, index) => (
                  <li key={product._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`flex-shrink-0 h-8 w-8 rounded-full bg-${index < 3 ? ['blue', 'green', 'yellow'][index] : 'gray'}-100 flex items-center justify-center mr-3`}>
                        <span className={`text-${index < 3 ? ['blue', 'green', 'yellow'][index] : 'gray'}-600 font-medium`}>{index + 1}</span>
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.category === 'dog' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                            {product.category === 'dog' ? 'Chó' : 'Mèo'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{product.totalSold} sản phẩm</p>
                      <p className="text-sm text-gray-500">{formatCurrency(product.totalAmount * product.totalSold)}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-4 text-center text-gray-500">Không có dữ liệu</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;