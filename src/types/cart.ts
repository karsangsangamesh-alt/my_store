import { Product } from './Product';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}
