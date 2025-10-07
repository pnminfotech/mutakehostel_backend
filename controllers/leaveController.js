const LeaveRequest = require("../models/LeaveRequest");
const Tenant = require("../models/Tenant"); // assuming you already have this

/** Tenant: create a leave request */
exports.createLeave = async (req, res) => {
  try {
    const userId = req.user.id;             // from auth middleware
    const { leaveDate, note = "" } = req.body;

    if (!leaveDate) return res.status(400).json({ message: "leaveDate is required" });

    const d = new Date(leaveDate);
    const today = new Date(); today.setHours(0,0,0,0);
    if (isNaN(d.getTime()) || d <= today) {
      return res.status(400).json({ message: "Leave date must be in the future" });
    }

    // Optional: enforce 30-day notice on server as well
    const diffDays = Math.ceil((d - today) / (1000*60*60*24));
    if (diffDays < 30) {
      return res.status(400).json({ message: "Leave request must be at least 30 days in advance" });
    }

    const tenant = await Tenant.findById(userId).select("name");
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    // This will throw unique index error if there is already a pending/approved one.
    const doc = await LeaveRequest.create({
      tenant: tenant._id,
      tenantName: tenant.name,
      leaveDate: d,
      note: note.trim(),
      status: "pending",
      requestedAt: new Date(),
    });

    res.json({ ok: true, data: doc });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "You already have an active leave request (pending or approved). Please cancel/resolve it first."
      });
    }
    console.error("createLeave error:", err);
    res.status(500).json({ message: "Failed to submit leave request" });
  }
};

/** Tenant: my leave requests (latest first) */
exports.getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await LeaveRequest.find({ tenant: userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: list });
  } catch (err) {
    console.error("getMyLeaves error:", err);
    res.status(500).json({ message: "Failed to load leaves" });
  }
};

/** Admin: list leaves with optional filters: ?status=&q=&from=&to= */
exports.adminListLeaves = async (req, res) => {
  try {
    const { status, q, from, to } = req.query;
    const filter = {};

    if (status) filter.status = status; // pending/approved/rejected/canceled

    if (from || to) {
      filter.leaveDate = {};
      if (from) filter.leaveDate.$gte = new Date(from);
      if (to)   filter.leaveDate.$lte = new Date(to);
    }

    if (q) {
      filter.$or = [
        { tenantName: new RegExp(q, "i") },
        { note: new RegExp(q, "i") },
      ];
    }

    const list = await LeaveRequest.find(filter)
      .sort({ requestedAt: -1 })
      .lean();

    res.json({ data: list });
  } catch (err) {
    console.error("adminListLeaves error:", err);
    res.status(500).json({ message: "Failed to load leave requests" });
  }
};

/** Admin: change status: approved | rejected */
exports.adminSetStatus = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { status } = req.body; // approved / rejected

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const doc = await LeaveRequest.findById(id);
    if (!doc) return res.status(404).json({ message: "Leave request not found" });
    if (doc.status !== "pending") {
      return res.status(409).json({ message: "Only pending requests can be approved or rejected" });
    }

    doc.status = status;
    doc.decidedAt = new Date();
    doc.decidedBy = adminId;
    await doc.save();

    res.json({ ok: true, data: doc });
  } catch (err) {
    console.error("adminSetStatus error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/** Admin: cancel (reverse/void) a previously approved leave OR cancel a pending one */
exports.adminCancelLeave = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { reason = "" } = req.body;

    const doc = await LeaveRequest.findById(id);
    if (!doc) return res.status(404).json({ message: "Leave request not found" });

    if (doc.status === "canceled") {
      return res.status(409).json({ message: "Already canceled" });
    }

    doc.status = "canceled";
    doc.decidedAt = new Date();
    doc.decidedBy = adminId;
    doc.cancelReason = reason.trim();
    await doc.save();

    res.json({ ok: true, data: doc });
  } catch (err) {
    console.error("adminCancelLeave error:", err);
    res.status(500).json({ message: "Failed to cancel leave" });
  }
};
