export const getOrderHistory = () => {
    const orders = localStorage.getItem('orderHistory');
    return orders ? JSON.parse(orders) : [];
  };

  export const addOrder = (product, quantity, totalPrice) => {
    const orders = getOrderHistory();

    const newOrder = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
      quantity: quantity,
      price: product.price,
      totalPrice: totalPrice,
      date: new Date().toISOString(),
      status: 'Đã đặt hàng'
    };

    orders.unshift(newOrder);

    localStorage.setItem('orderHistory', JSON.stringify(orders));

    return newOrder;
  };