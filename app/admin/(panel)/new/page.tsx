import BusinessForm from "@/components/admin/BusinessForm";
import PageHeader from "@/components/PageHeader";
import { createBusiness } from "../actions";

export default function NewBusinessPage() {
  return (
    <div>
      <PageHeader
        title="New business"
        description="Creates the public review page and its QR code."
        back={{ href: "/admin", label: "Businesses" }}
      />
      <BusinessForm action={createBusiness} submitLabel="Create business" cancelHref="/admin" />
    </div>
  );
}
