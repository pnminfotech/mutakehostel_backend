const express = require("express");
const { createLeaveRequest, getTenantLeaves } = require("../controllers/leaveController");
const authTenant = require("../middleware/tenantAuth");

const router = express.Router();

router.post("/tenant/leave", authTenant, createLeaveRequest);
router.get("/tenant/leave", authTenant, getTenantLeaves);

module.exports = router;
