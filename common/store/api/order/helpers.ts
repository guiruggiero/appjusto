import { Order } from 'appjusto-types';
import { OrderItem } from 'appjusto-types/order/item';
import { isEmpty } from 'lodash';

export const addItemToOrder = (order: Order, item: OrderItem): Order => {
  if (!order?.items) return { ...order, items: [{ ...item }] };
  // searching for items for the same product that could be merged into one item
  const index = order.items.findIndex(
    (i) =>
      i.product.id === item.product.id &&
      // items with complement or notes are always added separatedly
      isEmpty(i.complements) &&
      isEmpty(item.complements) &&
      isEmpty(i.notes) &&
      isEmpty(item.notes)
  );
  if (index === -1) return { ...order, items: [...order.items, item] };
  return {
    ...order,
    items: [
      ...order.items.slice(0, index),
      mergeItems(order.items[index], item),
      ...order.items.slice(index + 1),
    ],
  };
};

export const getItemTotal = (item: OrderItem) => {
  const complemementsTotal = (item.complements ?? []).reduce(
    (total, complement) => total + complement.price,
    0
  );
  return item.quantity * (item.product.price + complemementsTotal);
};

export const getOrderTotal = (order: Order) =>
  (order.items ?? []).reduce((sum, item) => sum + getItemTotal(item), 0);

const mergeItems = (a: OrderItem, b: OrderItem): OrderItem => ({
  ...a,
  ...b,
  quantity: a.quantity + b.quantity,
});
