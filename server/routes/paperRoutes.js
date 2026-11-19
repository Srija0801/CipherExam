const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  createPaper,
  verifyPaper,
  decryptPaper,
  getCenterPapers,
} = require("../controllers/paperController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  upload.single("paper"),
  createPaper,
);

router.get(
  "/center",
  authMiddleware,
  roleMiddleware("CENTER"),
  getCenterPapers,
);

router.post(
  "/:id/verify",
  authMiddleware,
  roleMiddleware("CENTER"),
  verifyPaper,
);

router.post(
  "/:id/decrypt",
  authMiddleware,
  roleMiddleware("CENTER"),
  decryptPaper,
);

module.exports = router;
