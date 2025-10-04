// controllers/notifications.js
import mongoose from "mongoose";
import Leave from "../models/Leave.js";
import Notification from "../models/Notification.js";

export const approveLeave = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database unavailable" });
    }
    const { id } = req.params; // leave id
    const leave = await Leave.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    await Notification.create({
      type: "leave",
      refId: id,
      status: "approved",
      title: "Leave approved",
    });

    return res.json({ ok: true, leave });
  } catch (e) {
    console.error("approveLeave:", e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database unavailable" });
    }
    const { id } = req.params;
    const leave = await Leave.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    await Notification.create({
      type: "leave",
      refId: id,
      status: "rejected",
      title: "Leave rejected",
    });

    return res.json({ ok: true, leave });
  } catch (e) {
    console.error("rejectLeave:", e);
    return res.status(500).json({ error: "Server error" });
  }
};
