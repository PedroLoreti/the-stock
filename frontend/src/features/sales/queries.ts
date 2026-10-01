import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productKeys } from "@/features/products/queries";
import { salesApi, type CreateSaleInput } from "./api";

export const saleKeys = {
  all: ["sales"] as const,
  list: () => [...saleKeys.all, "list"] as const,
  detail: (id: string) => [...saleKeys.all, "detail", id] as const,
};

export function useSales() {
  return useQuery({
    queryKey: saleKeys.list(),
    queryFn: salesApi.list,
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => salesApi.get(id),
  });
}

/** Sales move stock, so both the sales and the products caches are refreshed. */
function useInvalidateSalesAndProducts() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: saleKeys.all }),
      queryClient.invalidateQueries({ queryKey: productKeys.all }),
    ]);
}

export function useCreateSale() {
  const invalidate = useInvalidateSalesAndProducts();
  return useMutation({
    mutationFn: (input: CreateSaleInput) => salesApi.create(input),
    onSuccess: invalidate,
  });
}

export function useCancelSale() {
  const invalidate = useInvalidateSalesAndProducts();
  return useMutation({
    mutationFn: (id: string) => salesApi.cancel(id),
    onSuccess: invalidate,
  });
}
