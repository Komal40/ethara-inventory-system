import axios from "axios";
import {
  type CustomResponse,
  type Product,
  type Customer,
  type Order,
  type DashboardMetrics,
} from "../types/api";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor unpacking the CustomResponse structural wrapper envelope
API.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || error.message),
);

export const productService = {
  getAll: () => API.get<any, CustomResponse<Product[]>>("/products/"),
  create: (data: Omit<Product, "id">) =>
    API.post<any, CustomResponse<Product>>("/products/", data),
  update: (id: number, data: Omit<Product, "id">) =>
    API.put<any, CustomResponse<Product>>(`/products/${id}`, data),
  delete: (id: number) => API.delete(`/products/${id}`),
};

export const customerService = {
  getAll: () => API.get<any, CustomResponse<Customer[]>>("/customers/"),
  create: (data: Omit<Customer, "id">) =>
    API.post<any, CustomResponse<Customer>>("/customers/", data),
  delete: (id: number) => API.delete(`/customers/${id}`),
};

export const orderService = {
  getAll: () => API.get<any, CustomResponse<Order[]>>("/orders/"),
  create: (data: {
    customer_id: number;
    items: { product_id: number; quantity: number }[];
  }) => API.post<any, CustomResponse<Order>>("/orders/", data),
  delete: (id: number) => API.delete(`/orders/${id}`),
};

export const dashboardService = {
  getMetrics: () =>
    API.get<any, CustomResponse<DashboardMetrics>>("/dashboard/"),
};
