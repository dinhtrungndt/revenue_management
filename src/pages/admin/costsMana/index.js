import React, { useState, useEffect } from 'react';
import {
  FaPlus, FaEdit, FaTrashAlt, FaEyeSlash, FaSearch,
  FaSort, FaFilter, FaFileInvoiceDollar, FaCalendarAlt,
  FaDollarSign, FaSpinner, FaTimes, FaSave, FaUpload, FaTags,
  FaEye, FaList, FaArchive, FaChevronLeft, FaChevronRight,
  FaInfoCircle,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchExpenses,
  fetchHiddenExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  hideExpense,
  restoreExpense,
} from '../../../stores/redux/actions/adminActions.js';

// Danh mục chi phí
const EXPENSE_CATEGORIES = [
  { value: 'utilities', label: 'Tiện ích' },
  { value: 'rent', label: 'Thuê mặt bằng' },
  { value: 'salary', label: 'Lương nhân viên' },
  { value: 'supplies', label: 'Vật tư' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'others', label: 'Khác' },
];

// Hàm format ngày tháng
const formatDateToYYYYMMDD = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CostsMana = () => {
  const { isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();
  const {
    expenses,
    hiddenExpenses,
    totalAmount,
    totalHiddenAmount,
    expensesLoading,
    expensesError,
    hiddenExpensesLoading,
    hiddenExpensesError,
  } = useSelector((state) => state.adminReducer);

  console.log('totalAmount:', totalAmount);

  // State cho hiển thị danh sách chính/ẩn
  const [viewMode, setViewMode] = useState('active'); // 'active' hoặc 'hidden'

  // State cho form thêm/sửa chi phí
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' hoặc 'edit'
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'others',
    date: formatDateToYYYYMMDD(new Date()),
    isRecurring: false,
    recurringPeriod: 'none',
    attachments: [],
  });
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // State cho chế độ xem chi tiết
  const [showDetail, setShowDetail] = useState(false);
  const [detailExpense, setDetailExpense] = useState(null);

  // State cho bộ lọc
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    isRecurring: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Lấy danh sách chi phí
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      const params = {};
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.dateFrom) params.from = filters.dateFrom;
      if (filters.dateTo) params.to = filters.dateTo;
      if (filters.isRecurring !== '') params.isRecurring = filters.isRecurring;
      if (filters.search) params.search = filters.search; // Lọc search phía server

      dispatch(fetchExpenses(params));
      dispatch(fetchHiddenExpenses(params));
    }
  }, [isAuthenticated, user, filters, dispatch]);

  // Xử lý áp dụng bộ lọc
  const handleApplyFilters = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setFilters({
      search: formData.get('search') || '',
      category: formData.get('category') || 'all',
      dateFrom: formData.get('dateFrom') || '',
      dateTo: formData.get('dateTo') || '',
      isRecurring: formData.get('isRecurring') || '',
    });
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      dateFrom: '',
      dateTo: '',
      isRecurring: '',
    });
    setCurrentPage(1);
  };

  // Mở form thêm chi phí mới
  const handleAddExpense = () => {
    setFormData({
      title: '',
      description: '',
      amount: '',
      category: 'others',
      date: formatDateToYYYYMMDD(new Date()),
      isRecurring: false,
      recurringPeriod: 'none',
      attachments: [],
    });
    setAttachmentFiles([]);
    setFormMode('add');
    setShowForm(true);
  };

  // Mở form sửa chi phí
  const handleEditExpense = async (expense) => {
    setSelectedExpense(expense);
    setFormData({
      title: expense.title,
      description: expense.description || '',
      amount: expense.amount.toString(),
      category: expense.category,
      date: formatDateToYYYYMMDD(new Date(expense.date)),
      isRecurring: expense.isRecurring,
      recurringPeriod: expense.recurringPeriod,
      attachments: expense.attachments || [],
    });
    setAttachmentFiles([]);
    setFormMode('edit');
    setShowForm(true);
  };

  // Mở chi tiết chi phí
  const handleViewDetail = (expense) => {
    setDetailExpense(expense);
    setShowDetail(true);
  };

  // Đóng form
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedExpense(null);
    setFormData({
      title: '',
      description: '',
      amount: '',
      category: 'others',
      date: formatDateToYYYYMMDD(new Date()),
      isRecurring: false,
      recurringPeriod: 'none',
      attachments: [],
    });
    setAttachmentFiles([]);
  };

  // Đóng chi tiết
  const handleCloseDetail = () => {
    setShowDetail(false);
    setDetailExpense(null);
  };

  // Xử lý thay đổi input form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Xử lý thêm tệp đính kèm
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Kiểm tra kích thước file (ví dụ: tối đa 5MB)
    const validFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast.error('Một số file vượt quá kích thước 5MB');
    }
    setAttachmentFiles((prev) => [...prev, ...validFiles]);
  };

  // Xử lý xóa tệp đính kèm mới
  const handleRemoveNewFile = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Xử lý xóa tệp đính kèm đã lưu
  const handleRemoveExistingFile = (url) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((fileUrl) => fileUrl !== url),
    }));
  };

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('amount', formData.amount);
      data.append('category', formData.category);
      data.append('date', formData.date);
      data.append('isRecurring', formData.isRecurring);
      data.append('recurringPeriod', formData.recurringPeriod);

      attachmentFiles.forEach((file) => {
        data.append('attachments', file);
      });

      if (formMode === 'edit') {
        formData.attachments.forEach((url) => {
          data.append('existingAttachments', url);
        });
      }

      if (formMode === 'add') {
        await dispatch(createExpense(data));
        toast.success('Thêm chi phí thành công!');
      } else {
        await dispatch(updateExpense(selectedExpense._id, data));
        toast.success('Cập nhật chi phí thành công!');
      }

      handleCloseForm();
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu chi phí');
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xóa chi phí
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chi phí này?')) return;
    try {
      await dispatch(deleteExpense(expenseId));
      toast.success('Xóa chi phí thành công!');
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast.error('Không thể xóa chi phí');
    }
  };

  // Xử lý ẩn chi phí
  const handleHideExpense = async (expenseId) => {
    try {
      await dispatch(hideExpense(expenseId));
      toast.success('Ẩn chi phí thành công!');
    } catch (err) {
      console.error('Error hiding expense:', err);
      toast.error('Không thể ẩn chi phí');
    }
  };

  // Xử lý khôi phục chi phí
  const handleRestoreExpense = async (expenseId) => {
    try {
      await dispatch(restoreExpense(expenseId));
      toast.success('Khôi phục chi phí thành công!');
    } catch (err) {
      console.error('Error restoring expense:', err);
      toast.error('Không thể khôi phục chi phí');
    }
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);
  };

  // Format ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Lấy nhãn danh mục
  const getCategoryLabel = (value) => {
    const category = EXPENSE_CATEGORIES.find((cat) => cat.value === value);
    return category ? category.label : value;
  };

  // Tính toán phân trang
  const currentItems = viewMode === 'active'
    ? expenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : hiddenExpenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(
    (viewMode === 'active' ? expenses.length : hiddenExpenses.length) / itemsPerPage
  );

  // Chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Chuyển đổi chế độ xem
  const toggleViewMode = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-col space-y-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
          <FaFileInvoiceDollar className="mr-2 text-blue-600" />
          Quản lý Chi phí
        </h1>

        {/* Bộ chuyển đổi chế độ xem hiển thị/ẩn */}
        {/* <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button
            onClick={() => toggleViewMode('active')}
            className={`flex-1 px-3 sm:px-4 py-2 text-sm font-medium flex items-center justify-center ${
              viewMode === 'active' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaList className="mr-1 sm:mr-2" />
            <span>Đang hiển thị</span>
          </button>
          <button
            onClick={() => toggleViewMode('hidden')}
            className={`flex-1 px-3 sm:px-4 py-2 text-sm font-medium flex items-center justify-center ${
              viewMode === 'hidden' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaArchive className="mr-1 sm:mr-2" />
            <span>Đã ẩn</span>
          </button>
        </div> */}

        {/* Nút thêm mới và bộ lọc */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleAddExpense}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
          >
            <FaPlus className="mr-1" />
            Thêm chi phí mới
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center justify-center ${
              showFilters ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <FaFilter className="mr-1" />
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </button>
        </div>
      </div>

      {/* Tổng chi phí */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-lg font-semibold text-gray-700">
              {viewMode === 'active' ? 'Tổng chi phí đang hiển thị' : 'Tổng chi phí đã ẩn'}
            </h2>
            <p className="text-gray-500 text-sm">
              Tổng số: {viewMode === 'active' ? expenses.length : hiddenExpenses.length} chi phí
            </p>
          </div>
          <div className="bg-blue-50 px-6 py-3 rounded-lg">
            <span className="block text-blue-800 font-bold text-lg md:text-2xl">
              {formatCurrency(viewMode === 'active' ? totalAmount : totalHiddenAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Lỗi */}
      {(expensesError || hiddenExpensesError) && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Lỗi</p>
          <p>{expensesError?.message || hiddenExpensesError?.message}</p>
        </div>
      )}

      {/* Bộ lọc */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Bộ lọc</h2>
          <form onSubmit={handleApplyFilters}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Tìm kiếm chi phí..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả danh mục</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Đặt lại
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Áp dụng
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách chi phí - Mobile */}
      <div className="bg-white rounded-lg shadow overflow-hidden sm:hidden">
        {(expensesLoading || hiddenExpensesLoading) ? (
          <div className="p-4 text-center">
            <FaSpinner className="inline-block animate-spin text-blue-600 text-xl" />
            <span className="ml-2">Đang tải...</span>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {viewMode === 'active' ? 'Không có dữ liệu chi phí hiển thị' : 'Không có dữ liệu chi phí đã ẩn'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentItems.map((expense) => (
              <div key={expense._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-gray-900 cursor-pointer" onClick={() => handleViewDetail(expense)}>
                    {expense.title}
                  </div>
                  <div className="text-right font-medium text-red-600">{formatCurrency(expense.amount)}</div>
                </div>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <div>
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCategoryLabel(expense.category)}
                    </span>
                  </div>
                  <div className="text-gray-500">{formatDate(expense.date)}</div>
                </div>
                {expense.description && (
                  <div className="text-xs text-gray-500 mt-1 mb-2">{expense.description}</div>
                )}
                <div className="flex justify-between items-center mt-2">
                  <div>
                    {expense.isRecurring && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {expense.recurringPeriod === 'daily' && 'Hàng ngày'}
                        {expense.recurringPeriod === 'weekly' && 'Hàng tuần'}
                        {expense.recurringPeriod === 'monthly' && 'Hàng tháng'}
                        {expense.recurringPeriod === 'yearly' && 'Hàng năm'}
                      </span>
                    )}
                  </div>
                  <button
                      onClick={() => handleViewDetail(expense)}
                      className="text-blue-600"
                      aria-label="Xem chi tiết"
                    >
                      <FaInfoCircle size={16} />
                    </button>
                  <div className="flex space-x-3">
                    {/* <button
                      onClick={() => handleViewDetail(expense)}
                      className="text-blue-600"
                      aria-label="Xem chi tiết"
                    >
                      <FaInfoCircle size={16} />
                    </button> */}
                    {/* <button
                      onClick={() => handleEditExpense(expense)}
                      className="text-indigo-600"
                      aria-label="Chỉnh sửa"
                    >
                      <FaEdit size={16} />
                    </button> */}
                    {/* {viewMode === 'active' ? (
                      <button
                        onClick={() => handleHideExpense(expense._id)}
                        className="text-yellow-600"
                        aria-label="Ẩn"
                      >
                        <FaEyeSlash size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestoreExpense(expense._id)}
                        className="text-green-600"
                        aria-label="Khôi phục"
                      >
                        <FaEye size={16} />
                      </button>
                    )} */}
                    {/* <button
                      onClick={() => handleDeleteExpense(expense._id)}
                      className="text-red-600"
                      aria-label="Xóa"
                    >
                      <FaTrashAlt size={16} />
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Phân trang - Mobile */}
        {!(expensesLoading || hiddenExpensesLoading) && totalPages > 1 && (
          <div className="p-4 flex justify-between items-center border-t border-gray-200">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-1 rounded border ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              <FaChevronLeft className="h-3 w-3 mr-1" />
              <span>Trước</span>
            </button>
            <span className="text-sm text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-1 rounded border ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              <span>Sau</span>
              <FaChevronRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Form thêm/sửa chi phí */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseForm}></div>
            </div>
            <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-blue-600 px-4 py-3 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg leading-6 font-medium text-white">
                      {formMode === 'add' ? 'Thêm chi phí mới' : 'Chỉnh sửa chi phí'}
                    </h3>
                    <button type="button" className="text-white hover:text-gray-200" onClick={handleCloseForm}>
                      <FaTimes />
                    </button>
                  </div>
                </div>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                          Số tiền (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaDollarSign className="text-gray-400" />
                          </div>
                          <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="1000"
                            required
                          />
                        </div>
                        {formData.amount && (
                          <div className="mt-1 text-xs text-right text-gray-500">
                            {formatCurrency(formData.amount)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                          Danh mục <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaTags className="text-gray-400" />
                          </div>
                          <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            {EXPENSE_CATEGORIES.map((cat) => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaCalendarAlt className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isRecurring"
                          name="isRecurring"
                          checked={formData.isRecurring}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
                          Đây là chi phí định kỳ
                        </label>
                      </div>
                      {formData.isRecurring && (
                        <div className="mt-2">
                          <label htmlFor="recurringPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                            Chu kỳ
                          </label>
                          <select
                            id="recurringPeriod"
                            name="recurringPeriod"
                            value={formData.recurringPeriod}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="none">Không định kỳ</option>
                            <option value="daily">Hàng ngày</option>
                            <option value="weekly">Hàng tuần</option>
                            <option value="monthly">Hàng tháng</option>
                            <option value="yearly">Hàng năm</option>
                          </select>
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tệp đính kèm</label>
                      {formData.attachments?.length > 0 && (
                        <div className="mb-2 space-y-1">
                          {formData.attachments.map((url, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm truncate"
                              >
                                {url.split('/').pop()}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingFile(url)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {attachmentFiles.length > 0 && (
                        <div className="mb-2 space-y-1">
                          {attachmentFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-gray-700 text-sm truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewFile(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500"
                        onClick={() => document.getElementById('attachments').click()}
                      >
                        <input
                          type="file"
                          id="attachments"
                          name="attachments"
                          onChange={handleFileChange}
                          multiple
                          className="hidden"
                        />
                        <div className="text-center">
                          <FaUpload className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-1 text-sm text-gray-500">Nhấp để chọn hoặc kéo thả tệp vào đây</p>
                          <p className="text-xs text-gray-400">Chấp nhận các định dạng JPG, PNG, PDF (tối đa 5MB)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        {formMode === 'add' ? 'Thêm chi phí' : 'Cập nhật'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={handleCloseForm}
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Chi tiết chi phí */}
      {showDetail && detailExpense && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseDetail}></div>
            </div>
            <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="bg-blue-600 px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-white">Chi tiết chi phí</h3>
                  <button type="button" className="text-white hover:text-gray-200" onClick={handleCloseDetail}>
                    <FaTimes />
                  </button>
                </div>
              </div>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                    <p className="text-gray-900">{detailExpense.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số tiền</label>
                    <p className="text-red-600">{formatCurrency(detailExpense.amount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                    <p className="text-gray-900">{getCategoryLabel(detailExpense.category)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày</label>
                    <p className="text-gray-900">{formatDate(detailExpense.date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Định kỳ</label>
                    <p className="text-gray-900">
                      {detailExpense.isRecurring ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {detailExpense.recurringPeriod === 'daily' && 'Hàng ngày'}
                          {detailExpense.recurringPeriod === 'weekly' && 'Hàng tuần'}
                          {detailExpense.recurringPeriod === 'monthly' && 'Hàng tháng'}
                          {detailExpense.recurringPeriod === 'yearly' && 'Hàng năm'}
                        </span>
                      ) : (
                        'Không định kỳ'
                      )}
                    </p>
                  </div>
                  {detailExpense.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                      <p className="text-gray-900">{detailExpense.description}</p>
                    </div>
                  )}
                  {detailExpense.attachments?.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tệp đính kèm</label>
                      <div className="space-y-1">
                        {detailExpense.attachments.map((url, index) => (
                          <div key={index} className="flex items-center bg-gray-50 p-2 rounded">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm truncate"
                            >
                              {url.split('/').pop()}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => {
                    handleCloseDetail();
                    handleEditExpense(detailExpense);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <FaEdit className="mr-2" />
                  Chỉnh sửa
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={handleCloseDetail}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostsMana;