import React from 'react';
import { HeaderPage } from '../../components/header';
import { petFoodProducts } from '../../stores/data/products';
import { useNavigate } from 'react-router-dom';
import { categories } from '../../stores/data/categories';

export const HomePage = () => {
  const navigate = useNavigate();

  // Lọc sản phẩm nổi bật
  const featuredProducts = petFoodProducts.filter(product => product.featured);

  // Định dạng giá tiền
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  // Hàm xử lý khi click vào sản phẩm
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Hàm xử lý khi click vào danh mục
  const handleCategoryClick = (path) => {
    navigate(path);
  };

  return (
    <div>
      {/* header */}
      <HeaderPage />
      {/* main */}
      <div className="p-4 pb-16">
        {/* Banner */}
        <div className="bg-blue-100 h-40 mb-4 flex items-center justify-center rounded shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Thức ăn cho thú cưng</h2>
            <p className="text-blue-700">Chất lượng cao - Giá tốt - Giao hàng nhanh</p>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h3 className="font-bold mb-3 text-gray-800">Danh mục sản phẩm</h3>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(category => (
              <div key={category.id} className="text-center" onClick={() => handleCategoryClick(category.path)}>
                <div className="bg-gray-100 h-16 w-16 rounded-full mx-auto mb-1 flex items-center justify-center shadow-sm hover:bg-blue-100 cursor-pointer">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <div className="text-sm">{category.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div>
          <h3 className="font-bold mb-3 text-gray-800">Sản phẩm nổi bật</h3>
          <div className="grid grid-cols-2 gap-4">
            {featuredProducts.slice(0, 4).map(product => (
              <div
                key={product.id}
                className="border rounded p-3 shadow-sm bg-white hover:shadow-md cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="bg-gray-200 h-32 mb-2 flex items-center justify-center">
                  <span className="text-gray-500">Hình ảnh</span>
                </div>
                <div className="font-medium text-gray-800 truncate">{product.name}</div>
                <div className="flex justify-between items-center">
                  <div className="text-red-600 font-medium">{formatPrice(product.price)}</div>
                  <div className="text-xs bg-blue-100 px-2 py-1 rounded-full">{product.category === 'dog' ? 'Chó' : 'Mèo'}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Xem thêm button */}
          <div className="mt-4 text-center">
            <button
              className="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700"
              onClick={() => navigate('/products')}
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2 text-gray-800">Tại sao chọn chúng tôi?</h3>
          <ul className="text-gray-700 space-y-2">
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              <span>Sản phẩm chính hãng, chất lượng cao</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              <span>Giá cả hợp lý, nhiều khuyến mãi</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              <span>Giao hàng nhanh trong 24h</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              <span>Đổi trả dễ dàng trong 7 ngày</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};