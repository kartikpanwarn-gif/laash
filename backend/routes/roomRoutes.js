const express = require('express');
const router = express.Router();
const { protect, ownerOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getRooms,
  myRooms,
  getRoom,
  getSimilar,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadImages,
} = require('../controllers/roomController');

// GET /api/rooms  – public, with optional filters
router.get('/', getRooms);

// GET /api/rooms/mine  – must come BEFORE /:id to avoid param collision
router.get('/mine', protect, myRooms);

// POST /api/rooms/upload  – multipart upload, owner only
router.post('/upload', protect, ownerOnly, upload.array('images', 6), uploadImages);

// GET /api/rooms/:id
router.get('/:id', getRoom);

// GET /api/rooms/:id/similar
router.get('/:id/similar', getSimilar);

// POST /api/rooms  – create room, owner only
router.post('/', protect, ownerOnly, createRoom);

// PUT /api/rooms/:id  – update room (ownership check inside controller)
router.put('/:id', protect, updateRoom);

// DELETE /api/rooms/:id  – delete room (ownership check inside controller)
router.delete('/:id', protect, deleteRoom);

module.exports = router;
