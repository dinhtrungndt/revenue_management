import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaBoxes, FaShoppingCart, FaMoneyBillWave, FaChartBar, FaReceipt, FaWarehouse, FaPercent, FaEyeSlash } from 'react-icons/fa';
import { MdOutlineProductionQuantityLimits } from 'react-icons/md';
import { FaMoneyBillTrendUp } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { fetchReportDashboard, fetchInventoryReport, fetchRevenueReport, fetchExpenseReport, fetchHiddenProducts } from '../../stores/redux/actions/adminActions.js';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { reports, loading, error, hiddenProducts, hiddenProductsLoading, hiddenProductsError } = useSelector((state) => state.adminReducer);

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [profitData, setProfitData] = useState({
    total: 0,
    recent: 0,
  });

  // Fetch all report data
  useEffect(() => {
    dispatch(fetchReportDashboard());
    dispatch(fetchInventoryReport());
    dispatch(fetchRevenueReport());
    dispatch(fetchExpenseReport({ from: dateRange.from, to: dateRange.to, groupBy: 'month' }));
    dispatch(fetchHiddenProducts());
  }, [dispatch, dateRange]);

  // Calculate profit data whenever reports change
  useEffect(() => {
    if (reports?.dashboard && reports?.expense) {
      const totalProfit = (reports.dashboard.revenue?.total || 0) - (reports.expense.total?.amount || 0);
      const recentProfit = (reports.dashboard.revenue?.recent || 0) -
        (reports.expense.groupedByTime ?
          Object.values(reports.expense.groupedByTime).reduce((sum, item) => {
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);
            return sum + item.totalAmount;
          }, 0) : 0);

      setProfitData({
        total: totalProfit,
        recent: recentProfit,
      });
    }
  }, [reports?.dashboard, reports?.expense]);

  // Định dạng tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Tính tỷ suất lợi nhuận (%) = (Lợi nhuận / Doanh thu) * 100
  const calculateProfitMargin = () => {
    if (!reports?.dashboard?.revenue?.total || reports.dashboard.revenue.total === 0) return 0;
    return ((profitData.total / reports.dashboard.revenue.total) * 100).toFixed(1);
  };

  if (loading || hiddenProductsLoading) {
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

  if (error || hiddenProductsError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p className="font-bold">Lỗi</p>
        <p>{error?.message || hiddenProductsError?.message || 'Có lỗi xảy ra'}</p>
      </div>
    );
  }

  const dashboard = reports?.dashboard || {
    orders: { total: 0, recent: 0 },
    revenue: { total: 0, recent: 0 },
    inventory: { totalProducts: 0, totalStock: 0, totalValue: 0 },
    topProducts: [],
  };

  const expenseData = reports?.expense || {
    total: { amount: 0 },
    groupedByCategory: {},
    groupedByTime: {},
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        <FaChartBar className="inline-block mr-2 text-blue-600" />
        Tổng quan doanh nghiệp
      </h1>

      {/* Row 1: Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Tổng doanh thu */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <FaMoneyBillWave className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-xs text-gray-500">Doanh thu</p>
              <p className="text-sm font-medium text-green-600">{formatCurrency(dashboard.revenue.total)}</p>
            </div>
          </div>
        </div>

        {/* Tổng chi phí */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <FaMoneyBillTrendUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-xs text-gray-500">Chi phí</p>
              <p className="text-sm font-medium text-red-600">{formatCurrency(expenseData.total?.amount || 0)}</p>
            </div>
          </div>
        </div>

        {/* Lợi nhuận */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <FaReceipt className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-xs text-gray-500">Lợi nhuận</p>
              <p className={`text-sm font-medium ${profitData.total >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(profitData.total)}
              </p>
            </div>
          </div>
        </div>

        {/* Tỷ suất lợi nhuận */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
              <FaPercent className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-xs text-gray-500">Tỷ suất lợi nhuận</p>
              <p className="text-sm font-medium text-gray-900">{calculateProfitMargin()}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Tổng đơn hàng */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <FaShoppingCart className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-500">Đơn hàng</p>
              <p className="text-sm font-medium text-gray-900">{dashboard.orders.total}</p>
              <p className="text-xs text-green-600">+{dashboard.orders.recent} trong 30 ngày</p>
            </div>
          </div>
        </div>

        {/* Tổng sản phẩm */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <MdOutlineProductionQuantityLimits className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-500">Sản phẩm</p>
              <p className="text-sm font-medium text-gray-900">{dashboard.inventory.totalProducts}</p>
              <p className="text-xs text-blue-600">{dashboard.inventory.totalStock} đơn vị tồn kho</p>
            </div>
          </div>
        </div>

        {/* Giá trị tồn kho */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
              <FaWarehouse className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-500">Giá trị tồn kho</p>
              <p className="text-sm font-medium text-gray-900">{formatCurrency(dashboard.inventory.totalValue)}</p>
            </div>
          </div>
        </div>

        {/* Sản phẩm ẩn */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <FaEyeSlash className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-500">Sản phẩm ẩn</p>
              <p className="text-sm font-medium text-gray-900">{hiddenProducts?.length || 0}</p>
              <Link to="/admin/inventory" className="text-xs text-blue-600 hover:underline">Xem chi tiết</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Báo cáo nhanh */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Báo cáo chi tiết</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/admin/inventory" className="bg-blue-50 p-4 rounded-lg flex items-center justify-between hover:bg-blue-100">
                <div className="flex items-center">
                  <FaBoxes className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-800 font-medium">Tồn kho</span>
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
                  <span className="text-gray-800 font-medium">Xuất kho</span>
                </div>
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/admin/revenue" className="bg-yellow-50 p-4 rounded-lg flex items-center justify-between hover:bg-yellow-100">
                <div className="flex items-center">
                  <FaMoneyBillWave className="h-5 w-5 text-yellow-600 mr-3" />
                  <span className="text-gray-800 font-medium">Doanh thu</span>
                </div>
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/admin/expense-report" className="bg-red-50 p-4 rounded-lg flex items-center justify-between hover:bg-red-100">
                <div className="flex items-center">
                  <FaMoneyBillTrendUp className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-gray-800 font-medium">Chi phí</span>
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
          <div className="p-4">
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
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.category === 'dog' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
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

      {/* Chi phí theo danh mục */}
      {expenseData?.groupedByCategory && (
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Chi phí theo danh mục</h2>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng chi phí
                  </th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Trên tổng
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(expenseData.groupedByCategory).map(([category, data], index) => {
                  const categoryInfo = [
                    { value: 'utilities', label: 'Tiện ích', color: '#3B82F6' },
                    { value: 'rent', label: 'Thuê mặt bằng', color: '#EF4444' },
                    { value: 'salary', label: 'Lương nhân viên', color: '#10B981' },
                    { value: 'supplies', label: 'Vật tư', color: '#F59E0B' },
                    { value: 'marketing', label: 'Marketing', color: '#8B5CF6' },
                    { value: 'maintenance', label: 'Bảo trì', color: '#EC4899' },
                    { value: 'others', label: 'Khác', color: '#6B7280' },
                  ].find((cat) => cat.value === category) || { label: category, color: '#6B7280' };

                  const percentage = expenseData.total.amount > 0
                    ? ((data.totalAmount / expenseData.total.amount) * 100).toFixed(1)
                    : 0;

                  return (
                    <tr key={index}>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: categoryInfo.color }}></div>
                          <div className="text-sm font-medium text-gray-900">{categoryInfo.label}</div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-500">{data.count}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatCurrency(data.totalAmount)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-500">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chi phí và doanh thu theo thời gian */}
      {expenseData?.groupedByTime && (
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Chi phí và doanh thu theo thời gian</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(expenseData.groupedByTime).map(([timeKey, data], index) => {
                let timeLabel = timeKey;
                if (timeKey.includes('-')) {
                  const [year, month] = timeKey.split('-');
                  timeLabel = `Tháng ${month}/${year}`;
                }

                const revenue = reports?.revenue?.monthly?.find((item) => item.month === timeKey)?.amount || 0;
                const profit = revenue - data.totalAmount;

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-700">{timeLabel}</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-500">Doanh thu</p>
                        <p className="text-sm font-medium text-green-600">{formatCurrency(revenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Chi phí</p>
                        <p className="text-sm font-medium text-red-600">{formatCurrency(data.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Lợi nhuận</p>
                        <p className={`text-sm font-medium ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {formatCurrency(profit)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;