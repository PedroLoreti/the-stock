import { PageHeader } from "@/components/layout/page-header";
import { NewSaleForm } from "@/features/sales/components/new-sale-form";

export default function NewSalePage() {
  return (
    <>
      <PageHeader title="New sale" description="Pick the products, adjust quantities and complete the sale." />
      <NewSaleForm />
    </>
  );
}
