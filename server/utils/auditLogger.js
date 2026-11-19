const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
  userId,
  action,
  examId = null,
  paperId = null,
  success,
  ipAddress = null,
  details = null,
}) => {
  try {
    await AuditLog.create({
      userId,
      action,
      examId,
      paperId,
      success,
      ipAddress,
      details,
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};

module.exports = createAuditLog;
