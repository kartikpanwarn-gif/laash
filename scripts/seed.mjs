import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/basera";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    phone: String,
    role: { type: String, enum: ["seeker", "owner"], default: "seeker" },
  },
  { timestamps: true }
);

const RoomSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    roomType: String,
    locality: String,
    amenities: [String],
    gender: String,
    images: [String],
    ownerName: String,
    ownerPhone: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Room = mongoose.models.Room || mongoose.model("Room", RoomSchema);

const img = (id) => `https://images.unsplash.com/${id}?w=1200&auto=format&fit=crop`;
const room1 = ["photo-1505691938895-1758d7feb511", "photo-1522708323590-d24dbb6b0267", "photo-1540518614846-7eded433c457"];
const room2 = ["photo-1493809842364-78817add7ffb", "photo-1502672260266-1c1ef2d93688", "photo-1505693416388-ac5ce068fe85"];
const room3 = ["photo-1560448204-e02f11c3d0e2", "photo-1554995207-c18c203602cb", "photo-1598928506311-c55ded91a20c"];
const room4 = ["photo-1560185007-cde436f6a4d0", "photo-1567016526105-22da7c13161a", "photo-1556909211-d5b2bcaa9e3a"];

const ROOMS = [
  {
    title: "Bright single room near HNBGU main gate",
    description: "Furnished single room 2 minutes walk from HNBGU campus. Includes WiFi, hot water and study table. Ideal for serious students.",
    price: 4500, roomType: "Single", locality: "HNBGU Campus", gender: "Male",
    amenities: ["WiFi", "Hot Water", "Furnished", "Study Table", "Power Backup"], images: room1.map(img),
    ownerName: "Rakesh Bisht", ownerPhone: "9876543210",
  },
  {
    title: "Affordable shared PG for girls — Bada Bazaar",
    description: "Twin sharing PG with home-cooked meals, secure entry and a friendly warden. Walking distance to Bada Bazaar market.",
    price: 3200, roomType: "PG", locality: "Bada Bazaar", gender: "Female",
    amenities: ["WiFi", "Hot Water", "Furnished", "Kitchen", "Water Tank"], images: room2.map(img),
    ownerName: "Sunita Devi", ownerPhone: "9810012345",
  },
  {
    title: "Spacious 1BHK in Parasnath Colony",
    description: "Independent 1BHK with private kitchen, attached bathroom and balcony. Perfect for couples or working professionals.",
    price: 8000, roomType: "1BHK", locality: "Parasnath Colony", gender: "Any",
    amenities: ["Furnished", "Kitchen", "Attached Bathroom", "Balcony", "Parking", "Power Backup"], images: room3.map(img),
    ownerName: "Manoj Negi", ownerPhone: "9756123456",
  },
  {
    title: "Budget double room near Bus Stand",
    description: "Twin sharing room walking distance from Srinagar bus stand. Easy access to shops, ATMs and eateries.",
    price: 2800, roomType: "Double", locality: "Bus Stand", gender: "Male",
    amenities: ["WiFi", "Hot Water", "Water Tank"], images: room4.map(img),
    ownerName: "Vikas Rawat", ownerPhone: "9999988888",
  },
  {
    title: "Quiet single room — Chaura Maidan",
    description: "Calm neighborhood, close to walking trails. Good natural light, well ventilated and clean.",
    price: 3500, roomType: "Single", locality: "Chaura Maidan", gender: "Any",
    amenities: ["WiFi", "Hot Water", "Furnished", "Study Table"], images: room1.map(img),
    ownerName: "Asha Pant", ownerPhone: "9012345678",
  },
  {
    title: "2BHK family flat — Gauchar Road",
    description: "Two bedroom flat with covered parking, suitable for families. Power backup available throughout the year.",
    price: 7500, roomType: "2BHK", locality: "Gauchar Road", gender: "Any",
    amenities: ["Furnished", "Parking", "Power Backup", "Kitchen", "Balcony", "Attached Bathroom"], images: room3.map(img),
    ownerName: "Deepak Joshi", ownerPhone: "9711122233",
  },
  {
    title: "Shared room for boys — HNBGU Campus",
    description: "Triple sharing student-friendly room. Common kitchen access. Mess available next door.",
    price: 2500, roomType: "Shared", locality: "HNBGU Campus", gender: "Male",
    amenities: ["WiFi", "Hot Water", "Kitchen", "Study Table"], images: room2.map(img),
    ownerName: "Pankaj Semwal", ownerPhone: "9633344455",
  },
  {
    title: "Furnished girls PG with mess — Bada Bazaar",
    description: "Single occupancy PG with breakfast and dinner included. Secure premises with female caretaker.",
    price: 6000, roomType: "PG", locality: "Bada Bazaar", gender: "Female",
    amenities: ["WiFi", "Hot Water", "Furnished", "Kitchen", "Power Backup", "Attached Bathroom"], images: room4.map(img),
    ownerName: "Reena Thapa", ownerPhone: "9844455566",
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to", MONGODB_URI);

  const ownerEmail = "owner@basera.dev";
  let owner = await User.findOne({ email: ownerEmail });
  if (!owner) {
    owner = await User.create({
      name: "Demo Owner",
      email: ownerEmail,
      password: await bcrypt.hash("password123", 10),
      phone: "9876543210",
      role: "owner",
    });
    console.log("Seeded owner user:", ownerEmail, "/ password123");
  }

  const seeker = await User.findOne({ email: "seeker@basera.dev" });
  if (!seeker) {
    await User.create({
      name: "Demo Seeker",
      email: "seeker@basera.dev",
      password: await bcrypt.hash("password123", 10),
      phone: "9000000000",
      role: "seeker",
    });
    console.log("Seeded seeker user: seeker@basera.dev / password123");
  }

  await Room.deleteMany({});
  const docs = ROOMS.map((r) => ({ ...r, owner: owner._id, available: true }));
  await Room.insertMany(docs);
  console.log(`Inserted ${docs.length} rooms.`);

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
