import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaSearch, FaDog, FaCat, FaBoxOpen, FaTruck } from 'react-icons/fa';
import { ProductService } from '../../services/apiService';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories] = useState([
    { id: 1, name: 'Thức ăn cho chó', icon: <FaDog size={24} />, path: '/products?category=dog' },
    { id: 2, name: 'Thức ăn cho mèo', icon: <FaCat size={24} />, path: '/products?category=cat' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch sản phẩm nổi bật khi component mount
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const products = await ProductService.getProducts({ featured: true });
        if (Array.isArray(products)) {
          setFeaturedProducts(products.slice(0, 4)); // Lấy tối đa 4 sản phẩm
        } else {
          console.error('Invalid API response: products is not an array', products);
          setError('Dữ liệu sản phẩm không hợp lệ');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Không thể tải sản phẩm nổi bật');
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Xử lý khi nhấp vào danh mục
  const handleCategoryClick = (path) => {
    navigate(path);
  };

  // Định dạng giá tiền VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    const searchQuery = e.target.search.value.trim();
    if (searchQuery) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <div className="relative bg-blue-600 py-12 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
            <span className="block">Thức ăn chất lượng</span>
            <span className="block text-yellow-300">cho thú cưng của bạn</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-blue-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Đa dạng sản phẩm dinh dưỡng, đảm bảo chất lượng dành cho chó và mèo cưng của bạn.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to="/products"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10"
              >
                Khám phá ngay
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                to="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Đăng ký tài khoản
              </Link>
            </div>
          </div>
        </div>
        {/* Search Box */}
        <div className="max-w-lg mx-auto mt-8">
          <form onSubmit={handleSearch} className="flex rounded-lg overflow-hidden shadow-lg">
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm sản phẩm thức ăn..."
              className="flex-grow px-4 py-3 text-gray-700 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-yellow-500 text-white px-6 py-3 flex items-center hover:bg-yellow-600"
            >
              <FaSearch className="mr-2" />
              <span>Tìm</span>
            </button>
          </form>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Danh mục sản phẩm
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Chọn thức ăn phù hợp cho thú cưng của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-3xl lg:mx-auto">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow duration-300"
              onClick={() => handleCategoryClick(category.path)}
            >
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                    {category.icon}
                  </div>
                  <FaArrowRight className="text-blue-500 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{category.name}</h3>
                <p className="mt-1 text-gray-500">
                  {category.id === 1
                    ? 'Sản phẩm dinh dưỡng cao cấp dành cho các loại chó'
                    : 'Thực phẩm đầy đủ dưỡng chất cho mèo mọi lứa tuổi'
                  }
                </p>
              </div>
              <div className="absolute bottom-0 w-full h-1 bg-blue-600"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Sản phẩm nổi bật
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Được nhiều khách hàng tin dùng
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <div
                key={product._id}
                className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-w-3 aspect-h-2 overflow-hidden bg-gray-200 group-hover:opacity-90">
                  <div className="h-48 flex items-center justify-center text-gray-500">Hình ảnh sản phẩm</div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        <Link to={`/product/${product._id}`}>
                          <span aria-hidden="true" className="absolute inset-0" />
                          {product.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {product.category === 'dog' ? 'Thức ăn cho chó' : 'Thức ăn cho mèo'}
                      </p>
                    </div>
                    <p className="text-lg font-medium text-red-600">{formatPrice(product.price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Xem tất cả sản phẩm
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Chúng tôi cam kết mang đến dịch vụ tốt nhất cho bạn và thú cưng
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full inline-block mb-4">
                <FaBoxOpen size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sản phẩm chất lượng</h3>
              <p className="text-gray-500">
                Đảm bảo nguồn gốc rõ ràng, chất lượng cao, đáp ứng tiêu chuẩn dinh dưỡng cho thú cưng.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full inline-block mb-4">
                <FaTruck size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Giao hàng nhanh chóng</h3>
              <p className="text-gray-500">
                Giao hàng trong vòng 24h cho khu vực nội thành và 1-3 ngày cho khu vực khác.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full inline-block mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Giá cả hợp lý</h3>
              <p className="text-gray-500">
                Cam kết giá tốt nhất trên thị trường, nhiều chương trình khuyến mãi hấp dẫn.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full inline-block mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Đổi trả dễ dàng</h3>
              <p className="text-gray-500">
                Đổi trả miễn phí trong vòng 7 ngày nếu sản phẩm có vấn đề về chất lượng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;