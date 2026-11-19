const express = require("express");

const router = express.Router();

const {
  createCenter,
  getCenters,
  assignCenterToExam,
} = require("../controllers/centerController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware("ADMIN"), createCenter);

router.get("/", authMiddleware, roleMiddleware("ADMIN"), getCenters);

router.post(
  "/:id/assign/:examId",
  authMiddleware,
  roleMiddleware("ADMIN"),
  assignCenterToExam,
);

module.exports = router;
