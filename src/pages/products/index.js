import React, { useState, useEffect } from 'react';
import { HeaderPage } from '../../components/header';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { petFoodProducts } from '../../stores/data/products';

export const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFilter = queryParams.get('category');
  const searchQuery = queryParams.get('search');

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showNoResults, setShowNoResults] = useState(false);

  // Định dạng giá tiền
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  // Lọc sản phẩm dựa trên tham số URL
  useEffect(() => {
    let results = [...petFoodProducts];

    // Lọc theo danh mục nếu có
    if (categoryFilter) {
      setActiveFilter(categoryFilter);
      results = results.filter(product => product.category === categoryFilter);
    } else if (!searchQuery) {
      setActiveFilter('all');
    }

    // Lọc theo từ khóa tìm kiếm nếu có
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setLocalSearchQuery(searchQuery);
      results = results.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(results);
    setShowNoResults(results.length === 0);
  }, [categoryFilter, searchQuery]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);

    // Xử lý URL với cả filter và search query
    let newUrl = '/products';
    const params = new URLSearchParams();

    if (filter !== 'all') {
      params.set('category', filter);
    }

    if (searchQuery) {
      params.set('search', searchQuery);
    }

    const queryString = params.toString();
    if (queryString) {
      newUrl += `?${queryString}`;
    }

    navigate(newUrl);
  };

  // Xử lý tìm kiếm từ form trong trang products
  const handleLocalSearch = (e) => {
    e.preventDefault();

    if (localSearchQuery.trim()) {
      let newUrl = '/products';
      const params = new URLSearchParams();

      if (activeFilter !== 'all') {
        params.set('category', activeFilter);
      }

      params.set('search', localSearchQuery.trim());

      const queryString = params.toString();
      if (queryString) {
        newUrl += `?${queryString}`;
      }

      navigate(newUrl);
    }
  };

  // Xử lý khi click vào sản phẩm
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Xóa bộ lọc tìm kiếm
  const clearSearch = () => {
    setLocalSearchQuery('');

    let newUrl = '/products';
    if (activeFilter !== 'all') {
      newUrl += `?category=${activeFilter}`;
    }

    navigate(newUrl);
  };

  return (
    <div>
      {/* header */}
      <HeaderPage />
      {/* main */}
      <div className="p-4 pb-16">
        <h2 className="text-xl font-bold mb-4">Danh sách sản phẩm</h2>

        {/* Form tìm kiếm ngay trong trang */}
        <div className="mb-4">
          <form onSubmit={handleLocalSearch} className="flex rounded overflow-hidden shadow-sm">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-grow border border-r-0 px-3 py-2 focus:outline-none"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 flex items-center"
            >
              <FaSearch />
            </button>
          </form>
        </div>

        {/* Bộ lọc */}
        <div className="flex mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`mr-2 px-4 py-1 rounded-full ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => handleFilterChange('dog')}
            className={`mr-2 px-4 py-1 rounded-full ${activeFilter === 'dog' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            🐶 Thức ăn cho chó
          </button>
          <button
            onClick={() => handleFilterChange('cat')}
            className={`mr-2 px-4 py-1 rounded-full ${activeFilter === 'cat' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            🐱 Thức ăn cho mèo
          </button>
        </div>

        {/* Hiển thị thông tin tìm kiếm */}
        {searchQuery && (
          <div className="mb-4 flex items-center justify-between bg-blue-100 p-2 rounded">
            <span>
              Kết quả tìm kiếm cho: <strong>{searchQuery}</strong> ({filteredProducts.length} sản phẩm)
            </span>
            <button
              onClick={clearSearch}
              className="text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-200"
            >
              Xóa tìm kiếm
            </button>
          </div>
        )}

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="border rounded p-3 shadow-sm bg-white hover:shadow-md cursor-pointer"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="bg-gray-200 h-32 mb-2 flex items-center justify-center">
                <span className="text-gray-500">Hình ảnh</span>
              </div>
              <div className="font-medium text-gray-800 truncate">{product.name}</div>
              <div className="text-sm text-gray-600 mb-1">{product.weight}</div>
              <div className="flex justify-between items-center">
                <div className="text-red-600 font-medium">{formatPrice(product.price)}</div>
                <div className="text-xs bg-blue-100 px-2 py-1 rounded-full">{product.category === 'dog' ? 'Chó' : 'Mèo'}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Không có sản phẩm */}
        {showNoResults && (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">Không tìm thấy sản phẩm nào phù hợp.</p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="text-blue-600 font-medium underline"
              >
                Xóa tìm kiếm và hiển thị tất cả sản phẩm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};