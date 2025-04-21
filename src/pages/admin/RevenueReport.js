import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchRevenueReport } from '../../stores/redux/actions/adminActions.js';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueReport = () => {
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector((state) => state.adminReducer);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [interval, setInterval] = useState('daily');

  useEffect(() => {
    // Chỉ fetch nếu có startDate hoặc endDate, tránh fetch không cần thiết
    if (startDate || endDate) {
      dispatch(fetchRevenueReport({ startDate, endDate, interval }));
    }
  }, [dispatch, startDate, endDate, interval]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.');
      return;
    }
    dispatch(fetchRevenueReport({ startDate, endDate, interval }));
  };

  // Định dạng tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Định dạng ngày/tháng cho biểu đồ
  const formatLabel = (item) => {
    return interval === 'daily' ? item.date : item.month;
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = {
    labels: (revenueReport.timeSeries || []).map(formatLabel),
    datasets: [
      {
        label: `Doanh thu (${interval === 'daily' ? 'Theo ngày' : 'Theo tháng'})`,
        data: (revenueReport.timeSeries || []).map((item) => item.revenue),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Biểu đồ doanh thu ${interval === 'daily' ? 'theo ngày' : 'theo tháng'}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Doanh thu (VND)',
        },
      },
      x: {
        title: {
          display: true,
          text: interval === 'daily' ? 'Ngày' : 'Tháng',
        },
      },
    },
  };

  // Xử lý dữ liệu báo cáo, đảm bảo không bị undefined
  const revenueReport = reports?.revenue || {
    summary: { totalRevenue: 0, totalOrders: 0 },
    timeSeries: [],
    categoryStats: [],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-500">
          <svg
            className="animate-spin h-10 w-10"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p className="font-bold">Lỗi</p>
        <p>{error.message || 'Đã xảy ra lỗi khi tải báo cáo. Vui lòng thử lại.'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
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
                  required
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
                  required
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
                disabled={loading}
              >
                <FaSearch className="mr-2 h-4 w-4" />
                {loading ? 'Đang tải...' : 'Lọc dữ liệu'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              <svg
                className="h-5 w-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng số đơn hàng</p>
              <p className="text-lg font-semibold">{revenueReport.summary.totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Biểu đồ doanh thu {interval === 'daily' ? 'theo ngày' : 'theo tháng'}</h2>
        </div>
        <div className="p-4 h-80">
          {revenueReport.timeSeries.length > 0 ? (
            <div className="h-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded">
              <p className="text-gray-500">Không có dữ liệu để hiển thị. Vui lòng chọn khoảng thời gian khác.</p>
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Category */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Doanh thu theo danh mục</h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Danh mục
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Số lượng bán
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Doanh thu
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tỷ lệ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueReport.categoryStats.length > 0 ? (
                  revenueReport.categoryStats.map((stats) => (
                    <tr key={stats.category}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {stats.category === 'dog'
                            ? 'Chó'
                            : stats.category === 'cat'
                            ? 'Mèo'
                            : stats.category === 'spa'
                            ? 'Spa'
                            : stats.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stats.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(stats.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  revenueReport.summary.totalRevenue
                                    ? (stats.revenue / revenueReport.summary.totalRevenue) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            {revenueReport.summary.totalRevenue
                              ? Math.round((stats.revenue / revenueReport.summary.totalRevenue) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      Không có dữ liệu danh mục
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Time Series Data Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            Chi tiết doanh thu {interval === 'daily' ? 'theo ngày' : 'theo tháng'}
          </h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {interval === 'daily' ? 'Ngày' : 'Tháng'}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Số đơn hàng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Doanh thu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueReport.timeSeries.length > 0 ? (
                  revenueReport.timeSeries.map((item) => (
                    <tr key={interval === 'daily' ? item.date : item.month}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatLabel(item)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.orders}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;