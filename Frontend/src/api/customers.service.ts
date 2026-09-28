import { getJson } from "./client";
import type {
  CustomersListResponse,
  CustomerDetailResponse,
  CustomerPredictionResponse,
  CustomerFilters,
} from "@/types/api";

function buildQuery(filters: CustomerFilters): string {
  const q = new URLSearchParams();
  if (filters.limit !== undefined) q.set("limit", String(filters.limit));
  if (filters.offset !== undefined) q.set("offset", String(filters.offset));
  if (filters.search) q.set("search", filters.search);
  if (filters.risk_category) q.set("risk_category", filters.risk_category);
  if (filters.contract) q.set("contract", filters.contract);
  if (filters.min_tenure !== undefined) q.set("min_tenure", String(filters.min_tenure));
  if (filters.max_tenure !== undefined) q.set("max_tenure", String(filters.max_tenure));
  if (filters.min_monthly_charges !== undefined)
    q.set("min_monthly_charges", String(filters.min_monthly_charges));
  if (filters.max_monthly_charges !== undefined)
    q.set("max_monthly_charges", String(filters.max_monthly_charges));
  if (filters.internet_service) q.set("internet_service", filters.internet_service);
  if (filters.payment_method) q.set("payment_method", filters.payment_method);
  if (filters.min_probability !== undefined)
    q.set("min_probability", String(filters.min_probability));
  if (filters.max_probability !== undefined)
    q.set("max_probability", String(filters.max_probability));
  if (filters.sort_by) q.set("sort_by", filters.sort_by);
  if (filters.sort_order) q.set("sort_order", filters.sort_order);
  return q.toString() ? `?${q}` : "";
}

export const customersService = {
  listCustomers: (filters: CustomerFilters = {}) =>
    getJson<CustomersListResponse>(`/customers${buildQuery(filters)}`),
  getCustomer: (customerId: string) =>
    getJson<CustomerDetailResponse>(`/customers/${encodeURIComponent(customerId)}`),
  getCustomerPrediction: (customerId: string) =>
    getJson<CustomerPredictionResponse>(
      `/customers/${encodeURIComponent(customerId)}/prediction`,
    ),
};
