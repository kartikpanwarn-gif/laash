import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Room from "@/models/Room";
import { getCurrentUser } from "@/lib/auth";
import ListingWizard from "@/components/ListingWizard";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }) {
  const user = getCurrentUser();
  if (!user) redirect("/login");
  if (!mongoose.isValidObjectId(params.id)) notFound();

  await dbConnect();
  const room = await Room.findById(params.id).lean();
  if (!room) notFound();
  if (String(room.owner) !== String(user.id)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-semibold">Edit listing</h1>
      <ListingWizard mode="edit" roomId={params.id} initial={JSON.parse(JSON.stringify(room))} />
    </div>
  );
}
