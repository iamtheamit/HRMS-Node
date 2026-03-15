// media.routes.js
// Routes for Cloudinary-backed media uploads (profile photos, documents, etc.).

const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const mediaController = require('../controllers/media.controller');
const { uploadMediaMiddleware } = require('../middleware/upload.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Media
 *     description: Upload profile photos and documents to Cloudinary
 */

/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     tags: [Media]
 *     summary: Upload one or more media files
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [files]
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *                 example: hrms/profiles
 *               resourceType:
 *                 type: string
 *                 enum: [auto, image, video, raw]
 *                 default: auto
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 */
router.use(authMiddleware);
router.post('/upload', uploadMediaMiddleware.array('files', 10), mediaController.uploadMedia);

module.exports = router;
