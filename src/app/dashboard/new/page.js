import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ListingWizard from "@/components/ListingWizard";

export const dynamic = "force-dynamic";

export default function NewListingPage() {
  const user = getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "owner") redirect("/rooms");
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-semibold">List a new room</h1>
      <p className="mb-6 text-sm text-gray-600">Fill in the details across 5 quick steps.</p>
      <ListingWizard mode="create" defaultOwner={{ name: user.name, phone: "" }} />
    </div>
  );
}
