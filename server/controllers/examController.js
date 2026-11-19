const Exam = require("../models/Exam");

const createExam = async (req, res) => {
  try {
    const {
      title,
      subject,
      examDate,
      startTime,
      duration,
      releaseTime,
      assignedCenters,
    } = req.body;

    if (
      !title ||
      !subject ||
      !examDate ||
      !startTime ||
      !duration ||
      !releaseTime
    ) {
      return res.status(400).json({
        message: "All exam fields are required",
      });
    }

    const exam = await Exam.create({
      title,
      subject,
      examDate,
      startTime,
      duration,
      releaseTime,
      assignedCenters: assignedCenters || [],
    });

    res.status(201).json({
      message: "Exam created successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create exam",
      error: error.message,
    });
  }
};

const getExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("assignedCenters", "name email role")
      .sort({ examDate: 1 });

    res.status(200).json({
      count: exams.length,
      exams,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch exams",
      error: error.message,
    });
  }
};

const getCenterExams = async (req, res) => {
  try {
    const exams = await Exam.find({
      assignedCenters: req.user.user,
    })
      .populate({
        path: "assignedCenters",
        select: "name email role",
      })
      .sort({ examDate: 1 });

    res.json({
      exams,
    });
  } catch (error) {
    console.error("Get center exams error:", error);

    res.status(500).json({
      message: "Failed to fetch assigned exams",
    });
  }
};

const getStudentExams = async (req, res) => {
  try {
    const exams = await Exam.find({
      status: { $in: ["PUBLISHED", "COMPLETED"] },
    })
      .select("_id title subject examDate startTime duration status")
      .sort({ examDate: 1 });

    res.json({ exams });
  } catch (error) {
    console.error("Get student exams error:", error);

    res.status(500).json({
      message: "Failed to fetch student exams",
    });
  }
};

const publishExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    if (exam.status === "PUBLISHED") {
      return res.status(400).json({
        message: "Exam is already published",
      });
    }

    if (exam.status === "COMPLETED") {
      return res.status(400).json({
        message: "Completed exam cannot be published",
      });
    }

    exam.status = "PUBLISHED";

    await exam.save();

    res.json({
      message: "Exam published successfully",
      exam,
    });
  } catch (error) {
    console.error("Publish exam error:", error);

    res.status(500).json({
      message: "Failed to publish exam",
    });
  }
};

module.exports = {
  createExam,
  getExams,
  getCenterExams,
  getStudentExams,
  publishExam,
};
