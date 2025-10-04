import mongoose from "mongoose";
import Invite from "../models/Invite.js";
import Form from "../models/Form.js"; // your existing tenant form model

export async function createForm(req, res) {
  const session = await mongoose.startSession();
  try {
    const {
      inviteToken, // << EXPECTED FROM FRONTEND
      // ... rest payload
    } = req.body;

    await session.withTransaction(async () => {
      // 1) Verify & atomically mark invite as used
      const now = new Date();
      const invite = await Invite.findOneAndUpdate(
        {
          token: inviteToken,
          usedAt: null,
          expiresAt: { $gt: now },
        },
        { $set: { usedAt: now } },
        { new: true, session }
      );

      if (!invite) {
        // Either invalid, already used, or expired
        throw Object.assign(new Error("Invalid or already used link"), { http: 409 });
      }

      // 2) Create tenant form (you already sanitize payload elsewhere)
      const doc = await Form.create([{ ...req.body }], { session });
      const saved = doc[0];

      // 3) Link for audit
      await Invite.updateOne(
        { _id: invite._id },
        { $set: { usedByFormId: saved._id } },
        { session }
      );

      res.status(201).json(saved);
    });
  } catch (err) {
    console.error("createForm error:", err);
    const code = err.http || 500;
    res.status(code).json({ message: err.message || "Failed to create form" });
  } finally {
    session.endSession();
  }
}
