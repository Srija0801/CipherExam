const express = require("express");

const { getAuditLogs } = require("../controllers/auditController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware("ADMIN"), getAuditLogs);

module.exports = router;
