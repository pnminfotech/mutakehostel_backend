const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const mongoose = require("mongoose");
const router = express.Router();

const Form = require("../models/formModels");
const Counter = require("../models/counterModel");
const DocumentFile = require("../models/documentFile");

const upload = multer({ storage: multer.memoryStorage() });
const TARGET = 10 * 1024; // 10 KB

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

/**
 * POST /api/forms-with-docs
 * multipart/form-data:
 *  - fields: name, joiningDate, depositAmount, phoneNo, address, ...
 *  - files:  documents (multiple)
 *  - text:   relations (one per file, optional; defaults to "Self")
 */
router.post("/forms-with-docs", upload.array("documents", 10), async (req, res) => {
  try {
    // 1) get next srNo atomically
    const counter = await Counter.findOneAndUpdate(
      { name: "form_srno" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const srNo = counter.seq;

    // 2) normalize fields from req.body (strings → numbers/dates where needed)
    const body = req.body;

    const toDate = (v) => (v ? new Date(v) : undefined);
    const toNum  = (v) => (v !== undefined && v !== '' ? Number(v) : undefined);

    const formPayload = {
      srNo,
      name: body.name,
      joiningDate: toDate(body.joiningDate),
      roomNo: body.roomNo,
      depositAmount: toNum(body.depositAmount),
      address: body.address,
      phoneNo: toNum(body.phoneNo),
      relativeAddress1: body.relativeAddress1,
      relativeAddress2: body.relativeAddress2,
      floorNo: body.floorNo,
      bedNo: body.bedNo,
      companyAddress: body.companyAddress,
      dateOfJoiningCollege: toDate(body.dateOfJoiningCollege),
      dob: toDate(body.dob),
      baseRent: toNum(body.baseRent),
      rents: [], // start empty
      leaveDate: body.leaveDate || undefined,
      documents: [], // we'll fill below
    };

    // 3) handle files → compress → store in DocumentFile → push refs
    const files = req.files || [];
    const relations = Array.isArray(body.relations)
      ? body.relations
      : (body.relations ? [body.relations] : []);

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // only accept images (optional guard)
      if (!/^image\/(jpeg|png|webp|gif|bmp|tiff)/i.test(f.mimetype)) {
        // skip or throw — here we skip
        continue;
      }

      const compressed = await compressUnder10KB(f.buffer);
      const docFile = await DocumentFile.create({
        fileName: f.originalname,
        contentType: "image/webp",
        size: compressed.length,
        data: compressed,
      });

      const relation = ["Self","Father","Mother","Husband","Sister","Brother"].includes(relations[i]) ? relations[i] : "Self";

      formPayload.documents.push({
        fileName: f.originalname,
        relation,
        fileId: docFile._id,
        contentType: docFile.contentType,
        size: docFile.size,
        url: `/api/documents/${docFile._id}`, // convenient link
      });
    }

    // 4) create form
    const created = await Form.create(formPayload);
    res.status(201).json({ ok: true, form: created });
  } catch (e) {
    console.error("forms-with-docs error:", e);
    res.status(400).json({ ok: false, message: e.message || "Failed to create form with documents" });
  }
});

module.exports = router;
