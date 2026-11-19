const express = require("express");

const router = express.Router();

const {
  createExam,
  getExams,
  getCenterExams,
  getStudentExams,
  publishExam,
} = require("../controllers/examController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware("ADMIN"), createExam);
router.get("/center", authMiddleware, roleMiddleware("CENTER"), getCenterExams);
router.get(
  "/student",
  authMiddleware,
  roleMiddleware("STUDENT"),
  getStudentExams,
);

router.get("/", authMiddleware, getExams);
router.patch(
  "/:id/publish",
  authMiddleware,
  roleMiddleware("ADMIN"),
  publishExam,
);

module.exports = router;
