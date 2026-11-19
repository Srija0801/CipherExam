const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      default: "application/pdf",
    },

    encryptedData: {
      type: Buffer,
      required: true,
    },

    iv: {
      type: Buffer,
      required: true,
    },

    authTag: {
      type: Buffer,
      required: true,
    },

    encryptedKeys: [
      {
        centerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ExamCenter",
          required: true,
        },

        encryptedKey: {
          type: Buffer,
          required: true,
        },
      },
    ],

    signature: {
      type: Buffer,
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Paper", paperSchema);
