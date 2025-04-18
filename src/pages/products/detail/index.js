import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addOrder } from '../../../services/orderService';
import { HeaderPage } from '../../../components/header';
import { petFoodProducts } from '../../../stores/data/products';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Định dạng giá tiền
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  // Lấy thông tin sản phẩm và sản phẩm liên quan
  useEffect(() => {
    // Tìm sản phẩm theo id
    const foundProduct = petFoodProducts.find(p => p.id === parseInt(id));

    if (foundProduct) {
      setProduct(foundProduct);

      // Tìm sản phẩm liên quan (cùng danh mục, khác id)
      const related = petFoodProducts
        .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
        .slice(0, 2);

      setRelatedProducts(related);
    } else {
      // Nếu không tìm thấy sản phẩm, chuyển hướng về trang sản phẩm
      navigate('/products');
    }
  }, [id, navigate]);

  // Tăng số lượng
  const increaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  // Giảm số lượng
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  // Mua sản phẩm
  const buyProduct = () => {
    const totalPrice = product.price * quantity;
    const newOrder = addOrder(product, quantity, totalPrice);

    // Hiển thị thông báo thành công
    setOrderSuccess(true);

    // Tự động chuyển đến trang lịch sử đơn hàng sau 2 giây
    setTimeout(() => {
      navigate('/order-history');
    }, 2000);
  };

  // Xử lý khi click vào sản phẩm liên quan
  const handleRelatedProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Hiển thị loading nếu chưa có dữ liệu sản phẩm
  if (!product) {
    return (
      <div>
        <HeaderPage />
        <div className="p-4 flex items-center justify-center h-screen">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeaderPage />
      <div className="p-4 pb-16">
        {/* Thông báo đặt hàng thành công */}
        {orderSuccess && (
          <div className="fixed inset-x-0 top-16 mx-auto w-11/12 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Đặt hàng thành công! Đang chuyển đến lịch sử đơn hàng...</span>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumbs */}
        <div className="flex items-center text-sm mb-4">
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate('/')}
          >
            Trang chủ
          </span>
          <span className="mx-2">›</span>
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate('/products')}
          >
            Sản phẩm
          </span>
          <span className="mx-2">›</span>
          <span className="text-gray-600">{product.name}</span>
        </div>

        {/* Product */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          {/* Image */}
          <div className="bg-gray-200 h-64 mb-4 flex items-center justify-center rounded">
            <span className="text-gray-500">Hình ảnh sản phẩm</span>
          </div>

          {/* Info */}
          <h1 className="text-xl font-bold mb-2">{product.name}</h1>
          <div className="mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
              {product.category === 'dog' ? 'Thức ăn cho chó' : 'Thức ăn cho mèo'}
            </span>
            <span className="text-gray-600 text-sm">{product.weight}</span>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-red-600 mb-4">
            {formatPrice(product.price)}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Mô tả sản phẩm:</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Số lượng:</h3>
            <div className="flex items-center">
              <button
                className="border h-10 w-10 flex items-center justify-center rounded-l"
                onClick={decreaseQuantity}
              >
                -
              </button>
              <div className="border-t border-b h-10 min-w-[50px] flex items-center justify-center">
                {quantity}
              </div>
              <button
                className="border h-10 w-10 flex items-center justify-center rounded-r"
                onClick={increaseQuantity}
              >
                +
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Thành tiền:</h3>
            <div className="text-xl font-bold text-red-600">
              {formatPrice(product.price * quantity)}
            </div>
          </div>

          {/* Buy button */}
          <button
            className="bg-red-600 text-white py-3 px-6 rounded-full w-full hover:bg-red-700"
            onClick={buyProduct}
          >
            Mua ngay
          </button>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold mb-3">Sản phẩm liên quan</h3>
            <div className="grid grid-cols-2 gap-4">
              {relatedProducts.map(relatedProduct => (
                <div
                  key={relatedProduct.id}
                  className="border rounded p-3 shadow-sm bg-white hover:shadow-md cursor-pointer"
                  onClick={() => handleRelatedProductClick(relatedProduct.id)}
                >
                  <div className="bg-gray-200 h-32 mb-2 flex items-center justify-center">
                    <span className="text-gray-500">Hình ảnh</span>
                  </div>
                  <div className="font-medium text-gray-800 truncate">{relatedProduct.name}</div>
                  <div className="text-red-600 font-medium">{formatPrice(relatedProduct.price)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};