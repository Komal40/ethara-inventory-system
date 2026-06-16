export interface CustomResponse<T> {
  status_code: number;
  status: boolean;
  message: string;
  data: T;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product: Product;
}

export interface Order {
  id: number;
  customer_id: number;
  total_amount: number;
  customer: Customer;
  items: OrderItem[];
}

export interface DashboardMetrics {
  total_products: number;
  total_customers: number;
  total_orders: number;
  low_stock_products: number;
}