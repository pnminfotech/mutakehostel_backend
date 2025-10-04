// // routes/notifications.js
// const express = require("express");
// const router = express.Router();

// // IMPORTANT: use the correct model path you actually have
// const Form = require("../models/formModels");

// // Optional: in-memory list of SSE clients
// const sseClients = new Set();

// // tiny helper to push SSE event to all clients
// function pushSSE(event, payload) {
//   const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
//   for (const res of sseClients) {
//     try { res.write(data); } catch {}
//   }
// }

// // ---- Example simple notification storage (Mongo model) ----
// // If you already have a Notification model, use it instead.
// const mongoose = require("mongoose");
// const NotificationSchema = new mongoose.Schema(
//   {
//     type: { type: String, enum: ["payment_report", "leave_request"], required: true },
//     tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
//     title: String,
//     message: String,
//     status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
//     read: { type: Boolean, default: false },
//     meta: mongoose.Schema.Types.Mixed,
//   },
//   { timestamps: true }
// );
// const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

// // ====== SSE endpoint ======
// router.get("/notifications/stream", (req, res) => {
//   // SSE headers
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   // CORS (adjust for your origin if needed)
//   res.setHeader("Access-Control-Allow-Origin", "*");

//   res.flushHeaders?.(); // in case compression is enabled

//   // keep alive pings
//   const keepAlive = setInterval(() => {
//     res.write("event: ping\ndata: {}\n\n");
//   }, 25000);

//   // remember this client
//   sseClients.add(res);

//   // initial hello
//   res.write(`event: hello\ndata: {"ok":true}\n\n`);

//   req.on("close", () => {
//     clearInterval(keepAlive);
//     sseClients.delete(res);
//     try { res.end(); } catch {}
//   });
// });

// // ====== Basic REST endpoints the UI may call ======

// // list notifications (admin)
// router.get("/notifications", async (req, res) => {
//   const { status = "pending", limit = 50 } = req.query;
//   const q = status === "all" ? {} : { status };
//   const items = await Notification.find(q).sort({ createdAt: -1 }).limit(Number(limit));
//   res.json(items);
// });

// // mark as read
// router.patch("/notifications/:id/read", async (req, res) => {
//   await Notification.findByIdAndUpdate(req.params.id, { $set: { read: true } });
//   res.sendStatus(204);
// });

// // approve/reject payment (this is just an example update)
// router.post("/notifications/:id/approve-payment", async (req, res) => {
//   const n = await Notification.findById(req.params.id);
//   if (!n) return res.status(404).json({ error: "Not found" });
//   if (n.type !== "payment_report") return res.status(400).json({ error: "Not a payment notification" });

//   // mark approved
//   n.status = "approved";
//   await n.save();

//   // Update tenant rents here if you want (n.meta should have amount, month, year, utr)
//   // ... your existing rent merge logic ...

//   // push SSE update to all admins
//   pushSSE("updated", { _id: n._id, status: "approved" });

//   res.json({ ok: true });
// });

// router.post("/notifications/:id/reject-payment", async (req, res) => {
//   const n = await Notification.findById(req.params.id);
//   if (!n) return res.status(404).json({ error: "Not found" });
//   if (n.type !== "payment_report") return res.status(400).json({ error: "Not a payment notification" });

//   n.status = "rejected";
//   await n.save();
//   pushSSE("updated", { _id: n._id, status: "rejected" });
//   res.json({ ok: true });
// });

// // approve/reject leave
// router.post("/notifications/:id/approve-leave", async (req, res) => {
//   const n = await Notification.findById(req.params.id);
//   if (!n) return res.status(404).json({ error: "Not found" });
//   if (n.type !== "leave_request") return res.status(400).json({ error: "Not a leave notification" });

//   n.status = "approved";
//   await n.save();
//   // update tenant leaveDate if meta.leaveDate exists
//   if (n.tenantId && n.meta?.leaveDate) {
//     await Form.findByIdAndUpdate(n.tenantId, { $set: { leaveDate: n.meta.leaveDate } });
//   }
//   pushSSE("updated", { _id: n._id, status: "approved" });
//   res.json({ ok: true });
// });

// router.post("/notifications/:id/reject-leave", async (req, res) => {
//   const n = await Notification.findById(req.params.id);
//   if (!n) return res.status(404).json({ error: "Not found" });
//   if (n.type !== "leave_request") return res.status(400).json({ error: "Not a leave notification" });

//   n.status = "rejected";
//   await n.save();
//   pushSSE("updated", { _id: n._id, status: "rejected" });
//   res.json({ ok: true });
// });

// // ===== Helper to create a notification (call this from your other routers) =====
// async function createNotification({ type, tenantId, title, message, meta }) {
//   const n = await Notification.create({ type, tenantId, title, message, meta, status: "pending" });
//   // send SSE "created" to all clients
//   pushSSE("created", n);
//   return n;
// }

// module.exports = { router, createNotification };






// routes/notifications.js
const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");
const Form = require("../models/formModels");

// Optional: in-memory SSE clients
const sseClients = new Set();
function pushSSE(event, payload) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try { res.write(data); } catch {}
  }
}

// ===== SSE endpoint =====
router.get("/notifications/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders?.();

  const keepAlive = setInterval(() => res.write("event: ping\ndata: {}\n\n"), 25000);
  sseClients.add(res);
  res.write(`event: hello\ndata: {"ok":true}\n\n`);

  req.on("close", () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
    try { res.end(); } catch {}
  });
});

// ===== Admin list (optional) =====
router.get("/notifications", async (req, res) => {
  const { status = "pending", limit = 50 } = req.query;
  const q = status === "all" ? {} : { status };
  const items = await Notification.find(q).sort({ createdAt: -1 }).limit(Number(limit));
  res.json(items);
});

// ===== Tenant list =====
router.get("/tenant/:tenantId/notifications", async (req, res) => {
  const items = await Notification.find({ tenantId: req.params.tenantId }).sort({ createdAt: -1 });
  res.json(items);
});

// ===== Mark as read =====
router.patch("/notifications/:id/read", async (req, res) => {
  const n = await Notification.findByIdAndUpdate(req.params.id, { $set: { read: true } }, { new: true });
  if (!n) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true, notification: n });
});

// ===== APPROVE / REJECT (match your frontend URLs) =====
// Decides based on notification.type
router.post("/notifications/:id/approve", async (req, res) => {  const n = await Notification.findById(req.params.id);
  if (!n) return res.status(404).json({ error: "Not found" });

  n.status = "approved";
  await n.save();

  // Side effects by type
  if (n.type === "leave_request" && n.leaveDate && n.tenantId) {
    await Form.findByIdAndUpdate(n.tenantId, { $set: { leaveDate: n.leaveDate } });
  }
  // If payment_report: update your Payment model here if desired.

  // Push a tenant-facing notification (so it appears in their table)
  await Notification.create({
    type: "system",
    tenantId: n.tenantId,
    title: "Request Approved",
    message: "Your request has been approved.",
    status: "sent"
  });

  pushSSE("updated", { _id: n._id, status: "approved" });
  res.json({ ok: true, notification: n });
});

router.post("/notifications/:id/reject", async (req, res) => {
  const n = await Notification.findById(req.params.id);
  if (!n) return res.status(404).json({ error: "Not found" });

  n.status = "rejected";
  await n.save();

  await Notification.create({
    type: "system",
    tenantId: n.tenantId,
    title: "Request Rejected",
    message: "Your request has been rejected.",
    status: "sent"
  });

  pushSSE("updated", { _id: n._id, status: "rejected" });
  res.json({ ok: true, notification: n });
});

// ===== Helper to create a new notification from other routers =====
async function createNotification({ type, tenantId, title, message, meta, amount, month, year, utr, note, receiptUrl, leaveDate }) {
  const n = await Notification.create({
    type, tenantId, title, message, status: "pending",
    amount, month, year, utr, note, receiptUrl, leaveDate,
    ...(meta ? { meta } : {})
  });
  pushSSE("created", n);
  return n;
}

// expose helper while keeping the router export a function
router.createNotification = createNotification;

module.exports = router;
