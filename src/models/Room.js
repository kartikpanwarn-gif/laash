import mongoose from "mongoose";

export const LOCALITIES = [
  "HNBGU Campus",
  "Bada Bazaar",
  "Parasnath Colony",
  "Bus Stand",
  "Chaura Maidan",
  "Gauchar Road",
];

export const ROOM_TYPES = ["Single", "Double", "Shared", "PG", "1BHK", "2BHK"];
export const GENDERS = ["Male", "Female", "Any"];
export const AMENITIES = [
  "WiFi",
  "Hot Water",
  "Parking",
  "Furnished",
  "Attached Bathroom",
  "Kitchen",
  "Power Backup",
  "Water Tank",
  "Balcony",
  "Study Table",
];

const RoomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    roomType: { type: String, enum: ROOM_TYPES, required: true },
    locality: { type: String, enum: LOCALITIES, required: true },
    amenities: [{ type: String, enum: AMENITIES }],
    gender: { type: String, enum: GENDERS, default: "Any" },
    images: [{ type: String }],
    ownerName: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RoomSchema.index({ locality: 1, price: 1, roomType: 1, gender: 1 });

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);
