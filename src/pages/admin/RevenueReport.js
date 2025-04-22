import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import { fetchRevenueReport } from '../../stores/redux/actions/adminActions.js';

const RevenueReport = () => {
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector((state) => state.adminReducer);
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [interval, setInterval] = useState('daily');

  useEffect(() => {
    dispatch(fetchRevenueReport({ startDate, endDate, interval }));
  }, [dispatch, startDate, endDate, interval]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchRevenueReport({ startDate, endDate, interval }));
  };

  // Định dạng tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const revenueReport = reports.revenue || {
    summary: { totalRevenue: 0, totalOrders: 0, totalProfit: 0 },
    timeSeries: [],
    categoryStats: {},
    productStats: [],
    timeSeriesProducts: []
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

  // Chuyển đổi categoryStats thành mảng để xử lý dễ dàng hơn
  const categoryStatsArray = Object.entries(revenueReport.categoryStats || {}).map(([category, stats]) => {
    return {
      category,
      ...stats
    };
  });

  // Sản phẩm theo danh mục
  const productsByCategory = {};

  // Dữ liệu sản phẩm theo danh mục và thời gian
  const productsByTime = {};

  // Nếu có dữ liệu đơn hàng và sản phẩm, cần xử lý để hiển thị chi tiết sản phẩm
  if (revenueReport.orders && revenueReport.orders.length > 0) {
    revenueReport.orders.forEach(order => {
      if (order.status !== 'Đã hủy') {
        const orderDate = new Date(order.createdAt);
        let timeKey;

        if (interval === 'monthly') {
          const month = orderDate.getMonth() + 1;
          const year = orderDate.getFullYear();
          timeKey = `${year}-${month.toString().padStart(2, '0')}`;
        } else {
          const day = orderDate.getDate();
          const month = orderDate.getMonth() + 1;
          const year = orderDate.getFullYear();
          timeKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }

        // Xử lý sản phẩm trong đơn hàng
        order.products.forEach(item => {
          if (!item.product) return;

          const productId = item.product._id || item.product;
          const productName = item.name;
          const productCategory = item.product.category || 'unknown';
          const quantity = item.quantity;
          const price = item.price;
          const importPrice = item.product.importPrice || price * 0.7; // Ước tính
          const revenue = price * quantity;
          const cost = importPrice * quantity;
          const profit = revenue - cost;

          // Thêm vào thống kê theo danh mục
          if (!productsByCategory[productCategory]) {
            productsByCategory[productCategory] = {};
          }

          if (!productsByCategory[productCategory][productId]) {
            productsByCategory[productCategory][productId] = {
              id: productId,
              name: productName,
              category: productCategory,
              quantity: 0,
              price: price,
              importPrice: importPrice,
              revenue: 0,
              profit: 0
            };
          }

          productsByCategory[productCategory][productId].quantity += quantity;
          productsByCategory[productCategory][productId].revenue += revenue;
          productsByCategory[productCategory][productId].profit += profit;

          // Thêm vào thống kê theo thời gian
          const timeProductKey = `${timeKey}-${productId}`;
          if (!productsByTime[timeProductKey]) {
            productsByTime[timeProductKey] = {
              timeKey: timeKey,
              id: productId,
              name: productName,
              category: productCategory,
              quantity: 0,
              price: price,
              importPrice: importPrice,
              revenue: 0,
              profit: 0
            };
          }

          productsByTime[timeProductKey].quantity += quantity;
          productsByTime[timeProductKey].revenue += revenue;
          productsByTime[timeProductKey].profit += profit;
        });
      }
    });
  }

  // Chuyển đổi dữ liệu sang mảng để hiển thị
  const productStatsArray = [];
  for (const category in productsByCategory) {
    for (const productId in productsByCategory[category]) {
      productStatsArray.push(productsByCategory[category][productId]);
    }
  }

  // Sắp xếp sản phẩm theo doanh thu giảm dần
  productStatsArray.sort((a, b) => b.revenue - a.revenue);

  // Chuyển đổi dữ liệu thời gian sang mảng để hiển thị
  const timeSeriesProductsArray = Object.values(productsByTime);

  // Sắp xếp theo thời gian và tên sản phẩm
  timeSeriesProductsArray.sort((a, b) => {
    if (a.timeKey === b.timeKey) {
      return a.name.localeCompare(b.name);
    }
    return a.timeKey.localeCompare(b.timeKey);
  });

  // Kiểm tra nếu có dữ liệu chi tiết sản phẩm
  const hasProductDetails = productStatsArray.length > 0;
  const hasTimeSeriesProducts = timeSeriesProductsArray.length > 0;

  return (
    <div className="container mx-auto px-2 sm:px-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Bộ lọc báo cáo</h2>
        </div>
        <div className="p-4">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <input
                  type="date"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <input
                  type="date"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng thời gian</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              >
                <option value="daily">Theo ngày</option>
                <option value="monthly">Theo tháng</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSearch className="mr-2 h-4 w-4" />
                Lọc dữ liệu
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-3">
              <FaChartLine className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng doanh thu</p>
              <p className="text-lg font-semibold">{formatCurrency(revenueReport.summary.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng số đơn hàng</p>
              <p className="text-lg font-semibold">{revenueReport.summary.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-3">
              <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng lợi nhuận</p>
              <p className="text-lg font-semibold">{formatCurrency(revenueReport.summary.totalProfit || productStatsArray.reduce((sum, p) => sum + p.profit, 0))}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Biểu đồ doanh thu {interval === 'daily' ? 'theo ngày' : 'theo tháng'}</h2>
          </div>
          <div className="p-4 h-80">
            {reports?.revenue?.productStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Tên sản phẩm
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Danh mục
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Số lượng
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Giá nhập
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Giá bán
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Doanh thu
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Lợi nhuận
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.revenue.productStats.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.category === 'dog' ? 'Chó' :
                              product.category === 'cat' ? 'Mèo' :
                                product.category === 'spa' ? 'Spa' :
                                  product.category === 'gift' ? 'Quà tặng' : product.category}
                          </span>
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.quantity}
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(product.importPrice)}
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(product.revenue)}
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(product.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500">Không có dữ liệu để hiển thị</p>
            )}
          </div>
        </div>
      </div>

      {/* Revenue by Product */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {hasProductDetails ? 'Doanh thu theo sản phẩm' : 'Doanh thu theo danh mục'}
          </h2>
        </div>
        <div className="p-4">
          <div className="flex items-center bg-gray-50 rounded text-xs sm:text-sm p-2">
            <span className="text-gray-500 px-1">Kéo bảng ngang để xem thêm dữ liệu</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0 mt-2">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              {hasProductDetails ? (
                // Hiển thị chi tiết theo sản phẩm
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Tên sản phẩm
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Danh mục
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Số lượng
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Giá nhập
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Giá bán
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Doanh thu
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Lợi nhuận
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productStatsArray.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.category === 'dog' ? 'Chó' :
                              product.category === 'cat' ? 'Mèo' :
                                product.category === 'spa' ? 'Spa' :
                                  product.category === 'gift' ? 'Quà tặng' : product.category}
                          </span>
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.quantity}
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(product.importPrice)}
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(product.revenue)}
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(product.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                // Hiển thị theo danh mục nếu không có dữ liệu chi tiết sản phẩm
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Danh mục
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Số lượng
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Giá nhập TB
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Giá bán TB
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Doanh thu
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Lợi nhuận
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryStatsArray.length > 0 ? (
                      categoryStatsArray.map((stats) => {
                        // Giá nhập, doanh thu và lợi nhuận
                        const avgSellPrice = stats.revenue / stats.quantity;
                        const avgImportPrice = stats.profit !== undefined ?
                          (stats.revenue - stats.profit) / stats.quantity :
                          avgSellPrice * 0.7;
                        const profit = stats.profit !== undefined ?
                          stats.profit :
                          stats.revenue - (avgImportPrice * stats.quantity);

                        return (
                          <tr key={stats.category}>
                            <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {stats.category === 'dog' ? 'Chó' :
                                  stats.category === 'cat' ? 'Mèo' :
                                    stats.category === 'spa' ? 'Spa' :
                                      stats.category === 'gift' ? 'Quà tặng' : stats.category}
                              </span>
                            </td>
                            <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {stats.quantity}
                            </td>
                            <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(avgImportPrice)}
                            </td>
                            <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(avgSellPrice)}
                            </td>
                            <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(stats.revenue)}
                            </td>
                            <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(profit)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-2 sm:px-6 sm:py-4 text-center text-sm text-gray-500">
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Time Series Data Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {hasTimeSeriesProducts
              ? `Chi tiết doanh thu theo sản phẩm ${interval === 'daily' ? 'theo ngày' : 'theo tháng'}`
              : `Chi tiết doanh thu ${interval === 'daily' ? 'theo ngày' : 'theo tháng'}`}
          </h2>
        </div>
        <div className="p-4">
          <div className="flex items-center bg-gray-50 rounded text-xs sm:text-sm p-2">
            <span className="text-gray-500 px-1">Kéo bảng ngang để xem thêm dữ liệu</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0 mt-2">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              {hasTimeSeriesProducts ? (
                // Hiển thị doanh thu theo sản phẩm và thời gian
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {interval === 'daily' ? 'Ngày' : 'Tháng'}
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Sản phẩm
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Danh mục
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Số lượng
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Giá nhập
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Giá bán
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Doanh thu
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Lợi nhuận
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {timeSeriesProductsArray.map((item, index) => (
                      <tr key={`${item.id}-${item.timeKey}-${index}`}>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.timeKey}
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {item.category === 'dog' ? 'Chó' :
                              item.category === 'cat' ? 'Mèo' :
                                item.category === 'spa' ? 'Spa' :
                                  item.category === 'gift' ? 'Quà tặng' : item.category}
                          </span>
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(item.importPrice)}
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(item.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                // Hiển thị theo tổng hợp thời gian nếu không có chi tiết theo sản phẩm
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {interval === 'daily' ? 'Ngày' : 'Tháng'}
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Số đơn hàng
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Doanh thu
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Giá vốn
                      </th>
                      <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Lợi nhuận
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueReport.timeSeries?.length > 0 ? (
                      revenueReport.timeSeries.map((item) => {
                        // Nếu có trường profit thì dùng, không thì tính giá vốn là 70% doanh thu
                        const profit = item.profit !== undefined ? item.profit : item.revenue * 0.3;
                        const costOfGoods = item.revenue - profit;

                        return (
                          <tr key={interval === 'daily' ? item.date : item.month}>
                            <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {interval === 'daily' ? item.date : item.month}
                            </td>
                            <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.orders}
                            </td>
                            <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(item.revenue)}
                            </td>
                            <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(costOfGoods)}
                            </td>
                            <td className="px-4 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(profit)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-2 sm:px-6 sm:py-4 text-center text-sm text-gray-500">
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;