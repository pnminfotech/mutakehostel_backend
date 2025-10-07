// routes/tenantRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

const Form = require('../models/formModels');
const OtpSession = require('../models/OtpSession');
const authTenant = require('../middleware/tenantAuth');
const { docsUpload, avatarUpload, ekycUpload } = require('../lib/upload');
const Payment = require('../models/Payment');

// Debug ping (optional)
router.get('/auth/ping', (req, res) => res.json({ ok: true, at: '/api/tenant/auth/ping' }));

// ---------- AUTH (OTP) ----------
router.post('/auth/request-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "phone required" });

  const code = process.env.NODE_ENV === 'production'
    ? String(Math.floor(100000 + Math.random() * 900000))
    : '123456';

  await OtpSession.deleteMany({ phone });
  await OtpSession.create({ phone, code, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

  res.json({ ok: true, devCode: process.env.NODE_ENV === 'production' ? undefined : code });
});

router.post('/auth/verify', async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ message: "phone & code required" });

  const sess = await OtpSession.findOne({ phone, code });
  if (!sess || new Date(sess.expiresAt) < new Date()) {
    return res.status(400).json({ message: "Invalid/expired code" });
  }

  const me = await Form.findOne({ phoneNo: Number(phone) });
  if (!me) return res.status(404).json({ message: "Tenant not found" });

  await OtpSession.deleteMany({ phone });

  const token = jwt.sign(
    { id: me._id },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '30d' }
  );

  res.json({ token });
});

// ---------- ME ----------
router.get('/me', authTenant, async (req, res) => res.json(req.tenant));

// ---------- PROFILE ----------
router.put('/profile', authTenant, async (req, res) => {
  const up = {};
  ['name','email','address','companyAddress','emergencyContact','dob'].forEach(k => {
    if (req.body[k] != null) up[k] = req.body[k];
  });
  Object.assign(req.tenant, up);
  await req.tenant.save();
  res.json(req.tenant);
});

router.post('/profile/avatar', authTenant, avatarUpload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "no file" });
  const url = `/uploads/avatars/${req.file.filename}`;
  req.tenant.avatarUrl = url;
  await req.tenant.save();
  res.json({ avatarUrl: url });
});

// ---------- DOCS ----------
router.post('/docs', authTenant, docsUpload.array('documents'), async (req, res) => {
  const files = req.files || [];
  const mapped = files.map((f) => ({
    fileName: f.originalname,
    url: `/uploads/docs/${f.filename}`,
    contentType: f.mimetype,
    size: f.size,
    relation: "Self",
  }));
  req.tenant.documents = [...(req.tenant.documents || []), ...mapped];
  await req.tenant.save();
  res.json({ ok: true, added: mapped.length });
});

// ---------- RENTS ----------
router.get('/rents', authTenant, async (req, res) => {
  const t = req.tenant;
  const now = new Date();
  const y = now.getFullYear();
  const paidSet = new Set(
    (t.rents || [])
      .filter(r => r?.date && Number(r.rentAmount) > 0)
      .map(r => { const d = new Date(r.date); return `${d.getFullYear()}-${d.getMonth()}`; })
  );

  let totalDue = 0;
  const base = Number(t.baseRent || 0);
  for (let i = 0; i <= now.getMonth(); i++) {
    const key = `${y}-${i}`;
    if (!paidSet.has(key)) totalDue += base;
  }
  res.json({ currentYear: y, totalDue, rents: t.rents || [] });
});

// ---------- LEAVE ----------
router.post('/leave', authTenant, async (req, res) => {
  const { leaveDate } = req.body;
  if (!leaveDate) return res.status(400).json({ message: "leaveDate required" });
  req.tenant.leaveRequestDate = new Date(leaveDate);
  await req.tenant.save();
  res.json({ ok: true, leaveRequestDate: req.tenant.leaveRequestDate });
});

// ---------- ANNOUNCEMENTS ----------
router.get('/announcements', authTenant, async (_req, res) => {
  res.json([]); // replace with real announcements
});

// ---------- eKYC ----------
router.get('/ekyc', authTenant, async (req, res) => res.json(req.tenant.ekyc || { status: "not_started" }));

router.post('/ekyc', authTenant, ekycUpload.fields([
  { name: 'docs', maxCount: 10 },
  { name: 'selfie', maxCount: 1 },
]), async (req, res) => {
  const { aadhaarLast4, panLast4 } = req.body;
  const docs = (req.files?.docs || []).map(f => ({
    fileName: f.originalname,
    url: `/uploads/ekyc/${f.filename}`,
    contentType: f.mimetype,
    size: f.size,
    relation: "Self",
  }));
  const selfie = (req.files?.selfie || [])[0];
  const selfieUrl = selfie ? `/uploads/ekyc/${selfie.filename}` : undefined;

  req.tenant.ekyc = {
    ...(req.tenant.ekyc || {}),
    status: "pending",
    aadhaarLast4,
    panLast4,
    selfieUrl: selfieUrl || req.tenant.ekyc?.selfieUrl,
    docs: [ ...(req.tenant.ekyc?.docs || []), ...docs ],
  };
  await req.tenant.save();
  res.json({ ok: true, ekyc: req.tenant.ekyc });
});

// ---------- UPI ----------
router.get('/upi-qr', async (req, res) => {
  const amount = Number(req.query.amount || 0);
  const note = String(req.query.note || 'Rent');
  const payeeVPA  = process.env.UPI_VPA  || 'demo@upi';
  const payeeName = process.env.UPI_NAME || 'Hostel Owner';
  const url = `upi://pay?pa=${encodeURIComponent(payeeVPA)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
  try {
    const svg = await QRCode.toString(url, { type: 'svg', margin: 1, width: 256 });
    res.setHeader('Content-Type','image/svg+xml'); res.send(svg);
  } catch { res.status(500).send('QR error'); }
});

router.get('/upi-intent', (req, res) => {
  const amount = Number(req.query.amount || 0);
  const note = String(req.query.note || 'Rent');
  const payeeVPA  = process.env.UPI_VPA  || 'demo@upi';
  const payeeName = process.env.UPI_NAME || 'Hostel Owner';
  const url = `upi://pay?pa=${encodeURIComponent(payeeVPA)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
  res.redirect(url);
});

// ---------- PAYMENTS ----------
router.get('/payments/my', authTenant, async (req, res) => {
  const list = await Payment.find({ tenant: req.tenant._id }).sort({ createdAt: -1 });
  res.json(list);
});

router.post('/payments/report', authTenant, async (req, res) => {
  const { amount, utr, note, month, year } = req.body;
  if (!amount) return res.status(400).json({ message: 'amount required' });

  const p = await Payment.create({
    tenant: req.tenant._id,
    amount: Number(amount),
    utr: (utr || '').trim(),
    note: (note || '').trim(),
    month: (month ?? null),
    year:  (year ?? null),
  });

  res.json({ ok: true, payment: p });
});

module.exports = router;
