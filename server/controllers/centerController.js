const ExamCenter = require("../models/ExamCenter");
const User = require("../models/User");
const Exam = require("../models/Exam");

const createCenter = async (req, res) => {
  try {
    const { name, location, userId } = req.body;

    if (!name || !location || !userId) {
      return res.status(400).json({
        message: "Name, location and userId are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Center user not found",
      });
    }

    if (user.role !== "CENTER") {
      return res.status(400).json({
        message: "Selected user is not a CENTER",
      });
    }

    const existingCenter = await ExamCenter.findOne({ userId });

    if (existingCenter) {
      return res.status(400).json({
        message: "Exam center already exists for this user",
      });
    }

    const center = await ExamCenter.create({
      name,
      location,
      userId,
    });

    res.status(201).json({
      message: "Exam center created successfully",
      center,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create exam center",
      error: error.message,
    });
  }
};

const getCenters = async (req, res) => {
  try {
    const centers = await ExamCenter.find()
      .populate("userId", "name email role")
      .populate("assignedExams", "title subject examDate");

    res.status(200).json({
      count: centers.length,
      centers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch exam centers",
      error: error.message,
    });
  }
};

const assignCenterToExam = async (req, res) => {
  try {
    const { id, examId } = req.params;

    const center = await ExamCenter.findById(id);
    const exam = await Exam.findById(examId);

    if (!center) {
      return res.status(404).json({
        message: "Exam center not found",
      });
    }

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    if (!exam.assignedCenters.includes(center.userId)) {
      exam.assignedCenters.push(center.userId);
    }

    if (!center.assignedExams.includes(exam._id)) {
      center.assignedExams.push(exam._id);
    }

    await exam.save();
    await center.save();

    res.status(200).json({
      message: "Center assigned to exam successfully",
      exam,
      center,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to assign center",
      error: error.message,
    });
  }
};

module.exports = {
  createCenter,
  getCenters,
  assignCenterToExam,
};
