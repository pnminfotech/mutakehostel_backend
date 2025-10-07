const express = require("express");
const router = express.Router();
const {
  createLeave,
  getMyLeaves,
  adminListLeaves,
  adminSetStatus,
  adminCancelLeave,
} = require("../controllers/leaveController");

const { authMiddleware } = require("../middlewares/authMiddleware"); // must set req.user
const { isAdmin } = require("../middlewares/roleMiddleware");

// Tenant endpoints
router.post("/tenant/leave", authMiddleware, createLeave);
router.get("/tenant/leave/my", authMiddleware, getMyLeaves);

// Admin endpoints
router.get("/admin/leave", authMiddleware, isAdmin, adminListLeaves);
router.patch("/admin/leave/:id", authMiddleware, isAdmin, adminSetStatus);
router.patch("/admin/leave/:id/cancel", authMiddleware, isAdmin, adminCancelLeave);

module.exports = router;
