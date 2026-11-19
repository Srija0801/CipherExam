const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: ["LOGIN", "PAPER_UPLOAD", "PAPER_VERIFY", "PAPER_DECRYPT"],
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      default: null,
    },

    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paper",
      default: null,
    },

    success: {
      type: Boolean,
      required: true,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    details: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
