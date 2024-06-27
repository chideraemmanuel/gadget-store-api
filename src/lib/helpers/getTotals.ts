// interface OrderItemTypes {
//   product: string;
//   quantity: number;
// }

// export const getSubTotal = (order_items: OrderItemTypes[]) => {
//   let subTotal = 0;

//   order_items.forEach(async (order_item) => {
//     if (isNaN(order_item.quantity)) {
//       return response
//         .status(400)
//         .json({ error: 'Quantity should be a number' });
//     }

//     if (!mongoose.isValidObjectId(order_item.product)) {
//       return response.status(400).json({ error: 'Invalid Product ID' });
//     }

//     const fullProductDetails = await Product.findById(order_item.product);

//     if (!fullProductDetails) {
//       return response
//         .status(404)
//         .json({ error: 'Product with the supplied ID does not exist' });
//     }

//     subTotal = subTotal + fullProductDetails.price * order_item.quantity;
//   });

//   return subTotal;
// };

export interface PopulatedOrderItemTypes {
  product: { price: number };
  quantity: number;
}

export const getSubTotal = (order_items: PopulatedOrderItemTypes[]) => {
  let subTotal = 0;

  order_items.forEach((order_item) => {
    subTotal = subTotal + order_item.product.price * order_item.quantity;
  });

  return subTotal;
};

// export const getTotal = (cartItems: CartTypes[], discount: number) => {
//   const subTotal = getSubTotal(cartItems);
//   const total = subTotal - discount;

//   return total;
// };
