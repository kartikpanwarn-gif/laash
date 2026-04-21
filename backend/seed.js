require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');

// ─── Stable Unsplash room image sets ──────────────────────────────────────
const IMG = {
  single: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format',
    'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1200&auto=format',
  ],
  double: [
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format',
  ],
  shared: [
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format',
  ],
  pg: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format',
  ],
  bhk1: [
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&auto=format',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format',
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&auto=format',
  ],
  bhk2: [
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&auto=format',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&auto=format',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1200&auto=format',
  ],
};

const OWNER = {
  name: 'Demo Owner',
  email: 'owner@basera.in',
  password: 'password123',
  phone: '9876543210',
  role: 'owner',
};

const buildRooms = (ownerId) => [
  // 1 – HNBGU Campus
  {
    title: 'Cozy Single Room Near HNBGU Gate',
    description:
      'Fully furnished single-occupancy room just 5 minutes walk from HNBGU main gate, Srinagar Garhwal. Ideal for students. Includes attached bathroom, 24-hour water supply, and a study table.',
    price: 3500,
    roomType: 'Single',
    locality: 'HNBGU Campus',
    amenities: ['WiFi', 'Attached Bathroom', 'Study Table', '24hr Water', 'Inverter Backup'],
    gender: 'Male',
    images: IMG.single,
    ownerName: OWNER.name,
    ownerPhone: OWNER.phone,
    owner: ownerId,
    available: true,
  },
  // 2 – HNBGU Campus
  {
    title: 'Girls PG Accommodation – HNBGU Campus',
    description:
      'Safe and secure PG for girls near Hemvati Nandan Bahuguna Garhwal University. Meals included, CCTV surveillance, and strict entry timings. Close to university library and labs.',
    price: 5500,
    roomType: 'PG',
    locality: 'HNBGU Campus',
    amenities: ['Meals Included', 'WiFi', 'CCTV', 'Laundry', 'Attached Bathroom', 'Wardrobe'],
    gender: 'Female',
    images: IMG.pg,
    ownerName: OWNER.name,
    ownerPhone: OWNER.phone,
    owner: ownerId,
    available: true,
  },
  // 3 – Bada Bazaar
  {
    title: 'Affordable Shared Room in Bada Bazaar',
    description:
      'Budget-friendly shared room in the heart of Bada Bazaar, Srinagar Garhwal. Triple occupancy. Close to local markets, banks, and bus stand. Common bathroom, balcony with mountain view.',
    price: 2500,
    roomType: 'Shared',
    locality: 'Bada Bazaar',
    amenities: ['Balcony', 'Mountain View', 'Common Bathroom', 'Fan', 'Electricity Included'],
    gender: 'Any',
    images: IMG.shared,
    ownerName: OWNER.name,
    ownerPhone: OWNER.phone,
    owner: ownerId,
    available: true,
  },
  // 4 – Bada Bazaar
  {
    title: '1 BHK Flat in Bada Bazaar – Fully Furnished',
    description:
      'Spacious 1BHK flat in Bada Bazaar area. Ideal for a working couple or solo professional. Modular kitchen, furnished bedroom, geyser, and parking space. Easy access to market and transport.',
    price: 7500,
    roomType: '1BHK',
    locality: 'Bada Bazaar',
    amenities: ['Parking', 'Kitchen', 'Geyser', 'Furnished', 'WiFi Ready', 'Separate Entrance'],
    gender: 'Any',
    images: IMG.bhk1,
    ownerName: OWNER.name,
    ownerPhone: OWNER.phone,
    owner: ownerId,
    available: true,
  },
  // 5 – Parasnath Colony
  {
    title: 'Double Room – Parasnath Colony, Srinagar',
    description:
      'Well-maintained double room in quiet Parasnath Colony. Suitable for two students or colleagues. Attached bathroom, ceiling fan, and ample natural light. Landlord stays on premises.',
    price: 4000,
    roomType: 'Double',
    locality: 'Parasnath Colony',
    amenities: ['Attached Bathroom', 'Ceiling Fan', 'Natural Light', 'Quiet Area', 'Water 24hr'],
    gender: 'Male',
    images: IMG.double,
    ownerName: OWNER.name,
    ownerPhone: OWNER.phone,
    owner: ownerId,
    available: true,
  },
  // 6 – Bus Stand
  {
    title: 'Single Room Near Bus Stand – Easy Commute',
    description:
      'Compact single room just 2 minutes from Srinagar Garhwal Bus Stand. Perfect for daily commuters or students travelling frequently. Includes cot, fan, and common bathroom. Very affordable.',
    price: 2800,
    roomType: 'Single',
    locality: 'Bus Stand',
    amenities: ['Common Bathroom', 'Fan', 'Cot', 'Close to Transport'],
    gender: 'Any',
    images: IMG.single,
    ownerName: OWNER.name,
    ownerPhone: OWNER.phone,
    owner: ownerId,
    available: true,
  },
  // 7 – Chaura Maidan
  {
    title: '2 BHK Family Flat – Chaura Maidan',
    description:
      'Spacious 2BHK apartment in calm Chaura Maidan locality of Srinagar Garhwal. Ideal for families or small groups. Two furnished bedrooms, living room, kitchen, and two bathrooms. Scenic view of surrounding hills.',
    price: 8000,
    roomType: '2BHK',
    locality: 'Chaura Maidan',
    amenities: ['2 Bathrooms', 'Kitchen', 'Living Room', 'Parking', 'Hill View', 'Geyser', 'WiFi Ready'],
    gender: 'Any',
    images: IMG.bhk2,
    ownerName: OWNER.name,
    ownerPhone: OWNER.phone,
    owner: ownerId,
    available: true,
  },
  // 8 – Gauchar Road
  {
    title: 'Girls Single Room – Gauchar Road, Srinagar',
    description:
      'Safe, clean single room for girls on Gauchar Road. Landlady lives nearby for security. Close to HNBGU and Gauchar medical facilities. Attached bathroom, almirah, and study space provided.',
    price: 3800,
    roomType: 'Single',
    locality: 'Gauchar Road',
    amenities: ['Attached Bathroom', 'Almirah', 'Study Table', 'Lady Landlord', 'Quiet Locality'],
    gender: 'Female',
    images: IMG.single,
    ownerName: OWNER.name,
    ownerPhone: OWNER.phone,
    owner: ownerId,
    available: true,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not set. Create a .env file from .env.example');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Wipe existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    console.log('🗑️  Cleared existing Users and Rooms');

    // Create owner user
    const owner = await User.create(OWNER);
    console.log(`👤 Created owner: ${owner.name} <${owner.email}>`);

    // Seed rooms
    const rooms = buildRooms(owner._id);
    const created = await Room.insertMany(rooms);

    console.log('\n📋 Seeded Rooms:');
    created.forEach((r, i) => {
      console.log(
        `  ${i + 1}. [${r.roomType.padEnd(6)}] ${r.title.padEnd(50)} ₹${r.price}/mo  – ${r.locality}`
      );
    });

    console.log(`\n✅ Seed complete — ${created.length} rooms created.`);
    console.log('\n🔑 Demo login credentials:');
    console.log('   Email   : owner@basera.in');
    console.log('   Password: password123');
    console.log('   Role    : owner\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
