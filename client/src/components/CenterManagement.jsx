import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Building2,
  Link2,
  ArrowRight,
  MapPin,
  Mail,
  CheckCircle2,
  ShieldCheck,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

function CenterManagement() {
  const [centers, setCenters] = useState([]);
  const [exams, setExams] = useState([]);

  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [centerResponse, examResponse] = await Promise.all([
        api.get("/centers"),
        api.get("/exams"),
      ]);

      setCenters(centerResponse.data.centers || []);
      setExams(examResponse.data.exams || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Failed to load center management data",
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!selectedCenter || !selectedExam) {
      setError("Please select both a center and an exam.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      await api.post(`/centers/${selectedCenter}/assign/${selectedExam}`);

      setMessage("Exam assigned to center successfully.");

      setSelectedCenter("");
      setSelectedExam("");

      fetchData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Failed to assign exam to center",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card center-management-card">
      {/* HEADER */}
      <div className="section-header">
        <div>
          <span className="section-label">ACCESS CONTROL</span>

          <h2>Center Management</h2>

          <p>Assign examinations to authorized examination centers.</p>
        </div>

        <div className="section-icon center-icon">
          <Building2 size={20} strokeWidth={1.8} />
        </div>
      </div>

      {/* MESSAGES */}
      {message && (
        <div className="success-message">
          <CheckCircle2 size={15} strokeWidth={1.8} />
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          <AlertCircle size={15} strokeWidth={1.8} />
          {error}
        </div>
      )}

      {/* ASSIGNMENT PANEL */}
      <div className="assignment-panel">
        <div className="assignment-title">
          <div className="assignment-icon">
            <Link2 size={19} strokeWidth={1.8} />
          </div>

          <div>
            <strong>Assign Examination</strong>

            <span>Grant a center access to a specific examination.</span>
          </div>
        </div>

        <form className="assignment-form" onSubmit={handleAssign}>
          <div className="management-field">
            <label>EXAMINATION CENTER</label>

            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
            >
              <option value="">Select examination center</option>

              {centers.map((center) => (
                <option key={center._id} value={center._id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>

          <div className="assignment-arrow">
            <ArrowRight size={18} strokeWidth={1.7} />
          </div>

          <div className="management-field">
            <label>EXAMINATION</label>

            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="">Select examination</option>

              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="assign-btn" disabled={loading}>
            {loading ? (
              "Assigning..."
            ) : (
              <>
                <Link2 size={15} strokeWidth={1.8} />
                Assign Center
              </>
            )}
          </button>
        </form>
      </div>

      {/* REGISTERED CENTERS */}
      <div className="centers-section">
        <div className="centers-heading">
          <div>
            <h3>Registered Centers</h3>

            <p>Authorized examination centers in the system.</p>
          </div>

          <span className="count-pill">{centers.length} centers</span>
        </div>

        <div className="center-grid">
          {centers.length === 0 ? (
            <div className="center-empty">
              No examination centers registered.
            </div>
          ) : (
            centers.map((center) => (
              <div className="center-card" key={center._id}>
                <div className="center-card-top">
                  <div className="center-avatar">
                    <Building2 size={19} strokeWidth={1.8} />
                  </div>

                  <div className="center-status">
                    <CheckCircle2 size={13} strokeWidth={1.8} />
                    Active
                  </div>
                </div>

                <h4>{center.name}</h4>

                <p className="center-location">
                  <MapPin size={13} strokeWidth={1.8} />
                  {center.location}
                </p>

                {center.userId && (
                  <p className="center-email">
                    <Mail size={12} strokeWidth={1.8} />
                    {center.userId.email}
                  </p>
                )}

                <div className="center-divider"></div>

                <div className="center-meta">
                  <div>
                    <span>Assigned Exams</span>

                    <strong>
                      <CalendarDays size={13} strokeWidth={1.7} />
                      {center.assignedExams?.length || 0}
                    </strong>
                  </div>

                  <div>
                    <span>Access</span>

                    <strong className="access-active">
                      <ShieldCheck size={13} strokeWidth={1.7} />
                      Authorized
                    </strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CenterManagement;
