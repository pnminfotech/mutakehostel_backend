// routes/adminLeaveRoutes.js
const express = require("express");
const router = express.Router();
const LeaveRequest = require("../models/LeaveRequest");

// TODO: swap for your real admin middleware
const requireAdmin = (req, _res, next) => {
  req.admin = { id: "admin1" };
  next();
};

// List all leave requests
router.get("/leave", requireAdmin, async (_req, res) => {
  const list = await LeaveRequest.find().sort({ createdAt: -1 }).lean();
  res.json(list);
});

// Approve / Reject request
router.patch("/leave/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, reason = "" } = req.body; // "approved" | "rejected"
  if (!["approved", "rejected"].includes(status))
    return res.status(400).json({ message: "Invalid status" });

  const doc = await LeaveRequest.findById(id);
  if (!doc) return res.status(404).json({ message: "Request not found" });
  if (doc.status !== "pending")
    return res.status(400).json({ message: "Only pending requests can be updated" });

  doc.status = status;
  if (status === "rejected") doc.cancelReason = reason;
  await doc.save();

  res.json(doc);
});

module.exports = router;
