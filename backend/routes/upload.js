import { Router } from "express";
import { requireAdmin } from "../middleware/adminAuth.js";
import { upload } from "../middleware/upload.js";
import { deleteByPublicId, isCloudinaryReady, uploadBuffer } from "../cloudinary.js";

const router = Router();

function mapUploadResult(result) {
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

router.get("/status", (_req, res) => {
  res.json({ configured: isCloudinaryReady() });
});

router.post("/image", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image file provided (field: image)" });

    const folder = typeof req.body.folder === "string" ? req.body.folder : "products";
    const result = await uploadBuffer(req.file.buffer, {
      folder,
      cloudinary: {
        public_id: req.body.publicId || undefined,
      },
    });

    res.status(201).json(mapUploadResult(result));
  } catch (err) {
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

router.post("/images", requireAdmin, upload.array("images", 8), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ message: "No image files provided (field: images)" });
    }

    const folder = typeof req.body.folder === "string" ? req.body.folder : "products";
    const uploads = await Promise.all(
      req.files.map((file) => uploadBuffer(file.buffer, { folder }))
    );

    res.status(201).json({ images: uploads.map(mapUploadResult) });
  } catch (err) {
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

router.delete("/image", requireAdmin, async (req, res) => {
  try {
    const publicId = req.body.publicId || req.query.publicId;
    if (!publicId) return res.status(400).json({ message: "publicId is required" });

    const result = await deleteByPublicId(String(publicId));
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ message: err.message || "Delete failed" });
  }
});

export default router;
