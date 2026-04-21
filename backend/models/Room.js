const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    roomType: {
      type: String,
      enum: ['Single', 'Double', 'Shared', 'PG', '1BHK', '2BHK'],
      required: [true, 'Room type is required'],
    },
    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Any'],
      default: 'Any',
    },
    images: {
      type: [String],
      default: [],
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    ownerPhone: {
      type: String,
      required: [true, 'Owner phone is required'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Text index for search on title and description
roomSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Room', roomSchema);
