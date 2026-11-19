import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Upload,
  LockKeyhole,
  ShieldCheck,
  FileSignature,
  Send,
  FileText,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

function PaperManagement() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchExams = async () => {
    try {
      const response = await api.get("/exams");
      setExams(response.data.exams || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load examinations");
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedExam) {
      setError("Please select an examination.");
      return;
    }

    if (!file) {
      setError("Please select a PDF question paper.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const formData = new FormData();

      formData.append("examId", selectedExam);
      formData.append("paper", file);

      const response = await api.post("/papers", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(
        `Paper encrypted and uploaded successfully. Paper ID: ${response.data.paperId}`,
      );

      setSelectedExam("");
      setFile(null);

      const fileInput = document.getElementById("paper-file-input");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Failed to upload question paper",
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedExamData = exams.find((exam) => exam._id === selectedExam);

  return (
    <div className="dashboard-card paper-management-card">
      {/* HEADER */}
      <div className="section-header">
        <div>
          <span className="section-label">SECURE DISTRIBUTION</span>

          <h2>Paper Management</h2>

          <p>
            Upload, encrypt and securely distribute examination question papers.
          </p>
        </div>

        <div className="section-icon paper-icon">◈</div>
      </div>

      {/* SECURITY FLOW */}
      <div className="crypto-flow">
        <div className="crypto-step active">
          <div className="crypto-step-icon">
            <Upload size={16} strokeWidth={1.8} />
          </div>

          <div>
            <strong>Upload</strong>
            <span>PDF document</span>
          </div>
        </div>

        <div className="crypto-line">
          <ArrowRight size={13} strokeWidth={1.5} />
        </div>

        <div className="crypto-step">
          <div className="crypto-step-icon">
            <LockKeyhole size={16} strokeWidth={1.8} />
          </div>

          <div>
            <strong>Encrypt</strong>
            <span>AES-256-GCM</span>
          </div>
        </div>

        <div className="crypto-line">
          <ArrowRight size={13} strokeWidth={1.5} />
        </div>

        <div className="crypto-step">
          <div className="crypto-step-icon">
            <FileSignature size={16} strokeWidth={1.8} />
          </div>

          <div>
            <strong>Sign</strong>
            <span>SHA-256</span>
          </div>
        </div>

        <div className="crypto-line">
          <ArrowRight size={13} strokeWidth={1.5} />
        </div>

        <div className="crypto-step">
          <div className="crypto-step-icon">
            <Send size={16} strokeWidth={1.8} />
          </div>

          <div>
            <strong>Distribute</strong>
            <span>Authorized centers</span>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      {message && <div className="success-message">✓ {message}</div>}

      {error && <div className="error-message">! {error}</div>}

      {/* UPLOAD AREA */}
      <form className="paper-upload-form" onSubmit={handleUpload}>
        {/* EXAM SELECT */}

        <div className="paper-form-section">
          <div className="paper-section-heading">
            <div className="paper-number">01</div>

            <div>
              <h3>Select Examination</h3>

              <p>Choose the examination this question paper belongs to.</p>
            </div>
          </div>

          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="paper-exam-select"
          >
            <option value="">Select examination</option>

            {exams.map((exam) => (
              <option key={exam._id} value={exam._id}>
                {exam.title} — {exam.subject}
              </option>
            ))}
          </select>

          {/* SELECTED EXAM INFO */}

          {selectedExamData && (
            <div className="selected-exam-info">
              <div className="selected-exam-icon">▣</div>

              <div className="selected-exam-details">
                <strong>{selectedExamData.title}</strong>

                <span>{selectedExamData.subject}</span>
              </div>

              <div className="selected-exam-status">
                <span></span>

                {selectedExamData.status}
              </div>
            </div>
          )}
        </div>

        {/* FILE UPLOAD */}

        <div className="paper-form-section">
          <div className="paper-section-heading">
            <div className="paper-number">02</div>

            <div>
              <h3>Upload Question Paper</h3>

              <p>Only PDF files up to 10 MB are accepted.</p>
            </div>
          </div>

          <label
            className={`paper-dropzone ${file ? "has-file" : ""}`}
            htmlFor="paper-file-input"
          >
            <input
              id="paper-file-input"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              hidden
            />

            {!file ? (
              <>
                <div className="upload-cloud">
                  <Upload size={22} strokeWidth={1.8} />
                </div>

                <strong>Drop your question paper here</strong>

                <span>
                  or <b>browse files</b> from your computer
                </span>

                <small>PDF only · Maximum 10 MB</small>
              </>
            ) : (
              <>
                <div className="selected-file-icon">
                  <FileText size={21} strokeWidth={1.8} />
                </div>

                <strong>{file.name}</strong>

                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>

                <small className="change-file">
                  Click to choose a different file
                </small>
              </>
            )}
          </label>
        </div>

        {/* SECURITY INFORMATION */}

        <div className="paper-security-panel">
          <div className="paper-security-icon">
            <ShieldCheck size={19} strokeWidth={1.8} />
          </div>

          <div>
            <strong>Your paper will be protected automatically</strong>

            <p>
              CipherExam encrypts the PDF using AES-256-GCM, protects the
              encryption key using the authorized center's public key, and signs
              the encrypted package.
            </p>
          </div>
        </div>

        {/* SUBMIT */}

        <div className="paper-upload-footer">
          <div className="paper-ready">
            <span
              className={selectedExam && file ? "ready-dot" : "waiting-dot"}
            ></span>

            {selectedExam && file
              ? "Ready to securely upload"
              : "Select an exam and PDF to continue"}
          </div>

          <button
            type="submit"
            className="upload-paper-btn"
            disabled={loading || !file || !selectedExam}
          >
            <Upload size={16} strokeWidth={1.8} />
            {loading ? "Securing Paper..." : "Upload & Secure Paper"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PaperManagement;
