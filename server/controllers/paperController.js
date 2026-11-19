const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const Paper = require("../models/Paper");
const Exam = require("../models/Exam");
const ExamCenter = require("../models/ExamCenter");

const createAuditLog = require("../utils/auditLogger");

const {
  generateAESKey,
  generateIV,
  encryptWithAES,
  encryptAESKeyWithRSA,
  signData,
  verifySignature,
  decryptAESKeyWithRSA,
  decryptWithAES,
} = require("../utils/cryptoUtils");

const createPaper = async (req, res) => {
  try {
    const { examId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "PDF file is required",
      });
    }

    if (!examId) {
      return res.status(400).json({
        message: "examId is required",
      });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        message: "Only PDF files are allowed",
      });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    if (exam.assignedCenters.length === 0) {
      return res.status(400).json({
        message: "No centers assigned to this exam",
      });
    }

    const centers = await ExamCenter.find({
      userId: {
        $in: exam.assignedCenters,
      },
    });

    if (centers.length === 0) {
      return res.status(400).json({
        message: "Assigned centers could not be found",
      });
    }

    const centersWithoutKeys = centers.filter((center) => !center.publicKey);

    if (centersWithoutKeys.length > 0) {
      return res.status(400).json({
        message: "One or more assigned centers do not have public keys",
      });
    }

    const aesKey = generateAESKey();
    const iv = generateIV();

    const { encrypted, authTag } = encryptWithAES(req.file.buffer, aesKey, iv);

    const dataToSign = Buffer.concat([encrypted, iv, authTag]);

    const signature = signData(dataToSign, signingPrivateKey);

    const encryptedKeys = centers.map((center) => ({
      centerId: center._id,
      encryptedKey: encryptAESKeyWithRSA(aesKey, center.publicKey),
    }));

    const paper = await Paper.create({
      examId: exam._id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      encryptedData: encrypted,
      iv,
      authTag,
      encryptedKeys,
      uploadedBy: req.user.user,
      signature,
    });

    await createAuditLog({
      userId: req.user.user,
      action: "PAPER_UPLOAD",
      examId: exam._id,
      paperId: paper._id,
      success: true,
      ipAddress: req.ip,
      details: "Exam paper uploaded, encrypted and signed",
    });

    res.status(201).json({
      message: "Paper encrypted and uploaded successfully",
      paperId: paper._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to upload paper",
      error: error.message,
    });
  }
};

const verifyPaper = async (req, res) => {
  try {
    const { id } = req.params;

    const paper = await Paper.findById(id);

    if (!paper) {
      return res.status(404).json({
        message: "Paper not found",
      });
    }

    const exam = await Exam.findById(paper.examId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }
    console.log("CENTER USER FROM JWT:", req.user.user);
    console.log("PAPER EXAM ID:", paper.examId.toString());
    console.log(
      "ASSIGNED CENTER USER IDS:",
      exam.assignedCenters.map((id) => id.toString()),
    );

    const isAssigned = exam.assignedCenters.some(
      (centerUserId) => centerUserId.toString() === req.user.user.toString(),
    );

    if (!isAssigned) {
      return res.status(403).json({
        message: "This center is not assigned to this exam",
      });
    }

    const dataToVerify = Buffer.concat([
      paper.encryptedData,
      paper.iv,
      paper.authTag,
    ]);

    const isValid = verifySignature(
      dataToVerify,
      paper.signature,
      signingPublicKey,
    );

    if (!isValid) {
      await createAuditLog({
        userId: req.user.user,
        action: "PAPER_VERIFY",
        examId: exam._id,
        paperId: paper._id,
        success: false,
        ipAddress: req.ip,
        details: "Paper signature verification failed",
      });

      return res.status(400).json({
        message: "Signature verification failed",
        valid: false,
      });
    }

    await createAuditLog({
      userId: req.user.user,
      action: "PAPER_VERIFY",
      examId: exam._id,
      paperId: paper._id,
      success: true,
      ipAddress: req.ip,
      details: "Paper signature verified successfully",
    });

    res.status(200).json({
      message: "Paper signature verified successfully",
      valid: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to verify paper",
      error: error.message,
    });
  }
};

const decryptPaper = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find paper
    const paper = await Paper.findById(id);

    if (!paper) {
      return res.status(404).json({
        message: "Paper not found",
      });
    }

    // 2. Find exam
    const exam = await Exam.findById(paper.examId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    if (exam.status !== "PUBLISHED") {
      await createAuditLog({
        userId: req.user.user,
        action: "PAPER_DECRYPT",
        examId: exam._id,
        paperId: paper._id,
        success: false,
        ipAddress: req.ip,
        details: "Decryption blocked because exam is not published",
      });

      return res.status(403).json({
        message: "Exam is not published",
      });
    }

    // 3. Check center assignment
    const assignedCenterIds = exam.assignedCenters.map((centerId) =>
      centerId.toString(),
    );

    const currentUserId = req.user.user.toString();

    if (!assignedCenterIds.includes(currentUserId)) {
      return res.status(403).json({
        message: "This center is not assigned to this exam",
      });
    }

    // 4. Find this user's ExamCenter
    const center = await ExamCenter.findOne({
      userId: req.user.user,
    });

    if (!center) {
      return res.status(404).json({
        message: "Exam center not found",
      });
    }

    // 5. Check release time
    const currentTime = new Date();
    const releaseTime = new Date(exam.releaseTime);

    if (currentTime < releaseTime) {
      await createAuditLog({
        userId: req.user.user,
        action: "PAPER_DECRYPT",
        examId: exam._id,
        paperId: paper._id,
        success: false,
        ipAddress: req.ip,
        details: "Decryption blocked because release time has not been reached",
      });

      return res.status(403).json({
        message: "Paper cannot be decrypted before release time",
        releaseTime: releaseTime,
      });
    }

    // 6. Verify signature
    const dataToVerify = Buffer.concat([
      paper.encryptedData,
      paper.iv,
      paper.authTag,
    ]);

    const isValid = verifySignature(
      dataToVerify,
      paper.signature,
      signingPublicKey,
    );

    if (!isValid) {
      await createAuditLog({
        userId: req.user.user,
        action: "PAPER_DECRYPT",
        examId: exam._id,
        paperId: paper._id,
        success: false,
        ipAddress: req.ip,
        details: "Decryption blocked because paper signature is invalid",
      });

      return res.status(400).json({
        message: "Paper signature verification failed",
      });
    }

    // 7. Find encrypted AES key for this center
    const encryptedKeyEntry = paper.encryptedKeys.find(
      (entry) => entry.centerId.toString() === center._id.toString(),
    );

    if (!encryptedKeyEntry) {
      return res.status(403).json({
        message: "No encrypted key found for this center",
      });
    }

    // 8. Recover AES key using center private key
    const aesKey = decryptAESKeyWithRSA(
      encryptedKeyEntry.encryptedKey,
      centerPrivateKey,
    );

    // 9. Decrypt PDF
    const decryptedPdf = decryptWithAES(
      paper.encryptedData,
      aesKey,
      paper.iv,
      paper.authTag,
    );

    await createAuditLog({
      userId: req.user.user,
      action: "PAPER_DECRYPT",
      examId: exam._id,
      paperId: paper._id,
      success: true,
      ipAddress: req.ip,
      details: "Paper decrypted successfully",
    });

    // 10. Return PDF
    res.setHeader("Content-Type", paper.mimeType || "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${paper.originalName}"`,
    );

    return res.send(decryptedPdf);
  } catch (error) {
    console.error("DECRYPT ERROR:", error);

    return res.status(500).json({
      message: "Failed to decrypt paper",
      error: error.message,
    });
  }
};

const getCenterPapers = async (req, res) => {
  try {
    const Paper = require("../models/Paper");
    const Exam = require("../models/Exam");

    // Find exams assigned to this center
    const exams = await Exam.find({
      assignedCenters: req.user.user,
    }).select(
      "_id title subject examDate startTime duration releaseTime status",
    );

    const examIds = exams.map((exam) => exam._id);

    // Find papers belonging to those exams
    const papers = await Paper.find({
      examId: { $in: examIds },
    }).select("_id examId originalName mimeType createdAt");

    const result = papers.map((paper) => {
      const exam = exams.find(
        (exam) => exam._id.toString() === paper.examId.toString(),
      );

      return {
        _id: paper._id,
        originalName: paper.originalName,
        mimeType: paper.mimeType,
        createdAt: paper.createdAt,
        exam,
      };
    });

    res.json({
      papers: result,
    });
  } catch (error) {
    console.error("Get center papers error:", error);

    res.status(500).json({
      message: "Failed to fetch center papers",
    });
  }
};

const signingPrivateKey = fs.readFileSync(
  path.join(__dirname, "../utils/signing-private.pem"),
  "utf8",
);

const signingPublicKey = fs.readFileSync(
  path.join(__dirname, "../utils/signing-public.pem"),
  "utf8",
);

const centerPrivateKey = fs.readFileSync(
  path.join(__dirname, "../utils/center-private.pem"),
  "utf8",
);

module.exports = {
  createPaper,
  verifyPaper,
  decryptPaper,
  getCenterPapers,
};
