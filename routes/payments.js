const express = require("express");
const router = express.Router();
const PaymentNotification = require("../models/PaymentNotification");

// list notifications for the bell
router.get("/notifications", async (req, res) => {
  const { status = "all", limit = 30 } = req.query;
  const q = status === "all" ? {} : { status };
  const items = await PaymentNotification.find(q).sort({ createdAt: -1 }).limit(Number(limit));
  res.json(items);
});

// mark all read (filter optional)
router.post("/notifications/read-all", async (req, res) => {
  const { status = "all" } = req.body || {};
  const q = status === "all" ? {} : { status };
  await PaymentNotification.updateMany(q, { $set: { read: true } });
  res.sendStatus(204);
});

// mark single read
router.patch("/notifications/:id/read", async (req, res) => {
  await PaymentNotification.findByIdAndUpdate(req.params.id, { $set: { read: true } });
  res.sendStatus(204);
});

// approve / reject
router.post("/approve/:id", async (req, res) => {
  const n = await PaymentNotification.findByIdAndUpdate(
    req.params.id,
    { $set: { status: "approved", read: true } },
    { new: true }
  );
  if (!n) return res.sendStatus(404);
  res.json(n);
});

router.post("/reject/:id", async (req, res) => {
  const n = await PaymentNotification.findByIdAndUpdate(
    req.params.id,
    { $set: { status: "rejected", read: true } },
    { new: true }
  );
  if (!n) return res.sendStatus(404);
  res.json(n);
});

// (optional) a broader “reports” list the UI might call
router.get("/reports", async (req, res) => {
  const { status = "all", limit = 50 } = req.query;
  const q = status === "all" ? {} : { status };
  const items = await PaymentNotification.find(q).sort({ createdAt: -1 }).limit(Number(limit));
  res.json(items);
});

module.exports = router;
