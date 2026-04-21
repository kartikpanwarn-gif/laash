const Room = require('../models/Room');
const { cloudinaryConfigured } = require('../config/cloudinary');

// ─── GET /api/rooms ────────────────────────────────────────────────────────
const getRooms = async (req, res) => {
  try {
    const { minPrice, maxPrice, locality, roomType, gender, q } = req.query;

    const filter = {};

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    if (locality) {
      filter.locality = { $regex: new RegExp(locality, 'i') };
    }

    if (roomType) {
      filter.roomType = roomType;
    }

    if (gender) {
      filter.gender = gender;
    }

    // Text search on title / description
    if (q && q.trim()) {
      filter.$or = [
        { title: { $regex: new RegExp(q.trim(), 'i') } },
        { description: { $regex: new RegExp(q.trim(), 'i') } },
      ];
    }

    const rooms = await Room.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json(rooms);
  } catch (error) {
    console.error('getRooms error:', error);
    return res.status(500).json({ message: 'Server error fetching rooms' });
  }
};

// ─── GET /api/rooms/mine ───────────────────────────────────────────────────
const myRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(rooms);
  } catch (error) {
    console.error('myRooms error:', error);
    return res.status(500).json({ message: 'Server error fetching your rooms' });
  }
};

// ─── GET /api/rooms/:id ────────────────────────────────────────────────────
const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('owner', 'name email phone');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    return res.status(200).json(room);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Room not found' });
    }
    console.error('getRoom error:', error);
    return res.status(500).json({ message: 'Server error fetching room' });
  }
};

// ─── GET /api/rooms/:id/similar ───────────────────────────────────────────
const getSimilar = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const similar = await Room.find({
      _id: { $ne: room._id },
      $or: [{ locality: room.locality }, { roomType: room.roomType }],
    })
      .limit(4)
      .sort({ createdAt: -1 });

    return res.status(200).json(similar);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Room not found' });
    }
    console.error('getSimilar error:', error);
    return res.status(500).json({ message: 'Server error fetching similar rooms' });
  }
};

// ─── POST /api/rooms ───────────────────────────────────────────────────────
const createRoom = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      roomType,
      locality,
      amenities,
      gender,
      images,
      ownerName,
      ownerPhone,
      available,
    } = req.body;

    // Required field validation
    if (!title || !description || !price || !roomType || !locality || !ownerName || !ownerPhone) {
      return res.status(400).json({
        message: 'title, description, price, roomType, locality, ownerName and ownerPhone are required',
      });
    }

    // Resolve images: from multipart upload (req.files) or body array
    let resolvedImages = [];
    if (req.files && req.files.length > 0) {
      resolvedImages = req.files.map((f) => f.path || f.secure_url || f.url);
    } else if (images) {
      resolvedImages = Array.isArray(images) ? images : [images];
    }

    // Parse amenities if sent as JSON string
    let parsedAmenities = amenities;
    if (typeof amenities === 'string') {
      try {
        parsedAmenities = JSON.parse(amenities);
      } catch {
        parsedAmenities = amenities.split(',').map((a) => a.trim()).filter(Boolean);
      }
    }

    const room = await Room.create({
      title,
      description,
      price: Number(price),
      roomType,
      locality,
      amenities: parsedAmenities || [],
      gender: gender || 'Any',
      images: resolvedImages,
      ownerName,
      ownerPhone,
      owner: req.user._id,
      available: available !== undefined ? available : true,
    });

    return res.status(201).json(room);
  } catch (error) {
    console.error('createRoom error:', error);
    return res.status(500).json({ message: 'Server error creating room' });
  }
};

// ─── PUT /api/rooms/:id ────────────────────────────────────────────────────
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Only the owner of the room can update it
    if (room.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to update this room' });
    }

    const allowedFields = [
      'title', 'description', 'price', 'roomType', 'locality',
      'amenities', 'gender', 'images', 'ownerName', 'ownerPhone', 'available',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        room[field] = req.body[field];
      }
    });

    const updated = await room.save();
    return res.status(200).json(updated);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Room not found' });
    }
    console.error('updateRoom error:', error);
    return res.status(500).json({ message: 'Server error updating room' });
  }
};

// ─── DELETE /api/rooms/:id ─────────────────────────────────────────────────
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Only the owner of the room can delete it
    if (room.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to delete this room' });
    }

    await room.deleteOne();
    return res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Room not found' });
    }
    console.error('deleteRoom error:', error);
    return res.status(500).json({ message: 'Server error deleting room' });
  }
};

// ─── POST /api/rooms/upload ────────────────────────────────────────────────
const uploadImages = async (req, res) => {
  try {
    if (!cloudinaryConfigured) {
      return res.status(501).json({
        message:
          'Image upload is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your .env file.',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const urls = req.files.map((f) => f.path || f.secure_url || f.url);
    return res.status(200).json({ urls });
  } catch (error) {
    console.error('uploadImages error:', error);
    return res.status(500).json({ message: 'Server error uploading images' });
  }
};

module.exports = {
  getRooms,
  myRooms,
  getRoom,
  getSimilar,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadImages,
};
