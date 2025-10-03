// routes/invites.js  (CJS)
const express = require("express");
const crypto = require("crypto");
const Invite = require("../models/Invite"); // CJS model

const router = express.Router();

/** Create a one-time invite */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      phoneNo,
      roomNo,
      bedNo,
      baseRent,
      rentAmount,
      depositAmount,
      // expiresInDays // optional if you want
    } = req.body;

    const token = crypto.randomUUID();
    const inv = await Invite.create({
      token,
      name,
      phoneNo,
      roomNo,
      bedNo,
      baseRent,
      rentAmount,
      depositAmount,
      // createdBy: req.user?.id,
      // expiresAt: new Date(Date.now() + (expiresInDays ?? 7) * 864e5),
    });

    const origin =
      req.headers["x-origin"] ||
      `${req.protocol}://${req.get("host")}`;

    const url = new URL("/HostelManager/tenant-intake", origin);
    url.searchParams.set("tenant", "true");
    url.searchParams.set("lock", "1");
    url.searchParams.set("inv", token);

    // (optional) include prefill in the URL too
    if (name) url.searchParams.set("name", name);
    if (phoneNo) url.searchParams.set("phoneNo", phoneNo);
    if (roomNo) url.searchParams.set("roomNo", roomNo);
    if (bedNo) url.searchParams.set("bedNo", bedNo);
    if (baseRent != null) url.searchParams.set("baseRent", String(baseRent));
    if (rentAmount != null) url.searchParams.set("rentAmount", String(rentAmount));
    if (depositAmount != null) url.searchParams.set("depositAmount", String(depositAmount));

    res.json({ ok: true, token, url: url.toString() });
  } catch (err) {
    console.error("Create invite failed:", err);
    res.status(500).json({ ok: false, message: "Failed to create invite" });
  }
});

/** Validate invite and return prefill data */
router.get("/:token", async (req, res) => {
  try {
    const inv = await Invite.findOne({ token: req.params.token });
    if (!inv) return res.status(404).json({ ok: false, reason: "not_found" });

    const now = new Date();
    if (inv.usedAt) return res.status(409).json({ ok: false, reason: "used" });
    if (inv.expiresAt && inv.expiresAt <= now)
      return res.status(410).json({ ok: false, reason: "expired" });

    res.json({
      ok: true,
      prefill: {
        name: inv.name || "",
        phoneNo: inv.phoneNo || "",
        roomNo: inv.roomNo || "",
        bedNo: inv.bedNo || "",
        baseRent: inv.baseRent ?? "",
        rentAmount: inv.rentAmount ?? inv.baseRent ?? "",
        depositAmount: inv.depositAmount ?? "",
      },
    });
  } catch (err) {
    console.error("Validate invite failed:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

module.exports = router;
