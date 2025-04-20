import React, { useState, useEffect } from 'react';
import {
  FaChartBar, FaCalendarAlt, FaFilter, FaSpinner,
  FaDownload, FaChartPie, FaChartLine, FaFileInvoiceDollar
} from 'react-icons/fa';
import {
  formatDateToYYYYMMDD,
  formatDateToLocale,
  getMonthAndYear,
  getFirstDayOfMonth,
  getLastDayOfMonth
} from '../../../utils/dateUtils';
import { useAuth } from '../../../contexts/AuthContext';
import { ExpenseService } from '../../../services/apiService';

const EXPENSE_CATEGORIES = [
  { value: 'utilities', label: 'Tiện ích', color: '#3B82F6' }, // blue-500
  { value: 'rent', label: 'Thuê mặt bằng', color: '#EF4444' }, // red-500
  { value: 'salary', label: 'Lương nhân viên', color: '#10B981' }, // green-500
  { value: 'supplies', label: 'Vật tư', color: '#F59E0B' }, // amber-500
  { value: 'marketing', label: 'Marketing', color: '#8B5CF6' }, // violet-500
  { value: 'maintenance', label: 'Bảo trì', color: '#EC4899' }, // pink-500
  { value: 'others', label: 'Khác', color: '#6B7280' } // gray-500
];

const ExpenseReport = () => {
  const { isAuthenticated, user } = useAuth();

  // State cho bộ lọc báo cáo
  const [filters, setFilters] = useState({
    from: formatDateToYYYYMMDD(getFirstDayOfMonth(new Date().getFullYear(), new Date().getMonth() + 1)),
    to: formatDateToYYYYMMDD(new Date()),
    groupBy: 'month'
  });

  // State cho dữ liệu báo cáo
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy dữ liệu báo cáo
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        from: filters.from,
        to: filters.to,
        groupBy: filters.groupBy
      };

      const result = await ExpenseService.getExpenseReport(params);
      setReportData(result);
    } catch (err) {
      console.error('Error fetching expense report:', err);
      setError(err.response?.data?.message || 'Không thể tải báo cáo chi phí');
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount hoặc filters thay đổi
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchReportData();
    }
  }, [isAuthenticated, user, filters.from, filters.to, filters.groupBy]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);
  };

  // Format nhãn thời gian
  const formatTimeLabel = (key) => {
    if (filters.groupBy === 'day') {
      return formatDateToLocale(key);
    } else if (filters.groupBy === 'month') {
      const [year, month] = key.split('-');
      return `Tháng ${month}/${year}`;
    } else {
      return `Năm ${key}`;
    }
  };

  // Tạo dữ liệu cho biểu đồ danh mục
  const getCategoryChartData = () => {
    if (!reportData || !reportData.groupedByCategory) return [];

    return Object.entries(reportData.groupedByCategory).map(([category, data]) => {
      const categoryInfo = EXPENSE_CATEGORIES.find(cat => cat.value === category) || {
        label: category,
        color: '#6B7280' // default to gray
      };

      return {
        category: categoryInfo.label,
        value: data.totalAmount,
        count: data.count,
        color: categoryInfo.color
      };
    }).sort((a, b) => b.value - a.value); // Sort by value descending
  };

  // Tạo dữ liệu cho biểu đồ thời gian
  const getTimeChartData = () => {
    if (!reportData || !reportData.groupedByTime) return [];

    return Object.entries(reportData.groupedByTime).map(([key, data]) => ({
      time: formatTimeLabel(key),
      value: data.totalAmount,
      count: data.count,
      rawKey: key
    })).sort((a, b) => a.rawKey.localeCompare(b.rawKey)); // Sort by time ascending
  };

  // Tính phần trăm cho từng danh mục
  const calculatePercentage = (amount) => {
    if (!reportData || !reportData.total || reportData.total.amount === 0) return 0;
    return ((amount / reportData.total.amount) * 100).toFixed(1);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          <FaChartBar className="inline-block mr-2 text-blue-600" />
          Báo cáo Chi phí
        </h1>
      </div>

      {/* Bộ lọc báo cáo */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Bộ lọc</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline-block mr-1 text-blue-500" />
              Từ ngày
            </label>
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline-block mr-1 text-blue-500" />
              Đến ngày
            </label>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaFilter className="inline-block mr-1 text-blue-500" />
              Nhóm theo
            </label>
            <select
              name="groupBy"
              value={filters.groupBy}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hiển thị loading */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <FaSpinner className="animate-spin text-blue-600 h-10 w-10" />
          <span className="ml-3 text-blue-600 font-medium">Đang tải báo cáo...</span>
        </div>
      )}

      {/* Hiển thị lỗi */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Đã xảy ra lỗi</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nội dung báo cáo */}
      {!loading && !error && reportData && (
        <>
          {/* Tổng quan */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center mb-4">
              <FaFileInvoiceDollar className="text-blue-600 h-6 w-6 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Tổng quan chi phí</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-blue-600 text-sm font-medium">Tổng chi phí</div>
                <div className="text-gray-800 text-2xl font-bold mt-1">
                  {formatCurrency(reportData.total.amount)}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-green-600 text-sm font-medium">Số lượng giao dịch</div>
                <div className="text-gray-800 text-2xl font-bold mt-1">
                  {reportData.total.count}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-purple-600 text-sm font-medium">Chi phí trung bình</div>
                <div className="text-gray-800 text-2xl font-bold mt-1">
                  {formatCurrency(reportData.total.count > 0 ? reportData.total.amount / reportData.total.count : 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Biểu đồ phân bổ theo danh mục */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <FaChartPie className="text-blue-600 h-6 w-6 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Phân bổ theo danh mục</h2>
              </div>

              <div className="space-y-4">
                {getCategoryChartData().map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.value)} ({calculatePercentage(item.value)}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${calculatePercentage(item.value)}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Biểu đồ theo thời gian */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <FaChartLine className="text-blue-600 h-6 w-6 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Chi phí theo thời gian</h2>
              </div>

              <div className="space-y-4">
                {getTimeChartData().map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.time}</span>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.value)}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-blue-600"
                        style={{
                          width: `${calculatePercentage(item.value)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chi tiết chi phí theo danh mục */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Chi tiết theo danh mục</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giao dịch
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng chi phí
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trung bình
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tỷ lệ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCategoryChartData().map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <div className="text-sm font-medium text-gray-900">{item.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatCurrency(item.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {formatCurrency(item.count > 0 ? item.value / item.count : 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {calculatePercentage(item.value)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseReport;