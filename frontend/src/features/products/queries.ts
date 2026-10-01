import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  productsApi,
  type CreateProductInput,
  type ListProductsParams,
  type UpdateProductInput,
} from "./api";

export const productKeys = {
  all: ["products"] as const,
  list: (params: ListProductsParams) => [...productKeys.all, "list", params] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
  movements: (id: string) => [...productKeys.all, "movements", id] as const,
};

export function useProducts(params: ListProductsParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.list(params),
    // Keep the current page on screen while the next one (or a new search) loads.
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.get(id),
  });
}

export function useProductMovements(id: string) {
  return useQuery({
    queryKey: productKeys.movements(id),
    queryFn: () => productsApi.movements(id),
  });
}

/** Every product mutation invalidates the whole product cache: lists, detail and movements. */
function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all });
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateProductInput & { id: string }) => productsApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeactivateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: string) => productsApi.deactivate(id),
    onSuccess: invalidate,
  });
}

export function useRestoreProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: string) => productsApi.restore(id),
    onSuccess: invalidate,
  });
}

export function useRegisterStockEntry() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      productsApi.registerEntry(id, quantity),
    onSuccess: invalidate,
  });
}
