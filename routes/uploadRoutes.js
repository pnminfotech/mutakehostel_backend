// routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const TARGET = 10 * 1024; // 10 KB
const TENANTS_DIR = path.join(__dirname, "..", "uploads", "tenants");
fs.mkdirSync(TENANTS_DIR, { recursive: true });

async function compressUnder10KB(buf) {
  let q = 80, w = null;
  let out = await sharp(buf).webp({ quality: q }).toBuffer();
  while (out.length > TARGET && (q > 30 || w === null || w > 200)) {
    if (q > 30) q -= 10;
    else {
      const meta = await sharp(buf).metadata();
      w = w || meta.width || 800;
      w = Math.max(200, Math.floor(w * 0.8));
    }
    const p = sharp(buf);
    if (w) p.resize({ width: w, withoutEnlargement: true });
    out = await p.webp({ quality: q }).toBuffer();
  }
  if (out.length > TARGET) {
    out = await sharp(buf).resize({ width: 200, withoutEnlargement: true }).webp({ quality: 25 }).toBuffer();
  }
  return out;
}

// POST /api/uploads/docs   (field name: documents)
router.post("/docs", upload.array("documents", 10), async (req, res) => {
  try {
    const files = req.files || [];
    const results = [];
    for (const f of files) {
      const compressed = await compressUnder10KB(f.buffer);
      const base = path.parse(f.originalname).name.replace(/[^\w.-]/g, "_");
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}-${base}.webp`;
      const dest = path.join(TENANTS_DIR, name);
      fs.writeFileSync(dest, compressed);
      results.push({ url: `/uploads/tenants/${name}`, filename: name, size: compressed.length });
    }
    res.json({ ok: true, files: results });
  } catch (e) {
    console.error(e);
    res.status(400).json({ ok: false, message: e.message || "Upload failed" });
  }
});

module.exports = router;
