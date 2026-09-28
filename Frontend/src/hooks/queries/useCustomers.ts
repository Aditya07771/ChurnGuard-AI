import { useQuery } from "@tanstack/react-query";
import { customersService } from "@/api/customers.service";
import type { CustomerFilters } from "@/types/api";

export const CUSTOMER_KEYS = {
  list: (filters: CustomerFilters) => ["customers", "list", filters] as const,
  detail: (customerId: string) => ["customers", "detail", customerId] as const,
  prediction: (customerId: string) => ["customers", "prediction", customerId] as const,
};

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: CUSTOMER_KEYS.list(filters),
    queryFn: () => customersService.listCustomers(filters),
    staleTime: 2 * 60_000,
    retry: 1,
  });
}

export function useCustomer(customerId: string, enabled = true) {
  return useQuery({
    queryKey: CUSTOMER_KEYS.detail(customerId),
    queryFn: () => customersService.getCustomer(customerId),
    staleTime: 5 * 60_000,
    enabled: enabled && !!customerId,
    retry: 1,
  });
}

export function useCustomerPrediction(customerId: string, enabled = true) {
  return useQuery({
    queryKey: CUSTOMER_KEYS.prediction(customerId),
    queryFn: () => customersService.getCustomerPrediction(customerId),
    staleTime: 5 * 60_000,
    enabled: enabled && !!customerId,
    retry: 0, // Don't retry 409 errors
  });
}
