import { useEffect, useState } from "react";
import api from "../services/api";
import CenterManagement from "../components/CenterManagement";
import PaperManagement from "../components/PaperManagement";
import AuditLogs from "../components/AuditLogs";

import {
  ShieldCheck,
  UploadCloud,
  Send,
  LayoutDashboard,
  CalendarDays,
  Building2,
  FileKey2,
  ClipboardList,
  Search,
  Bell,
  LogOut,
  Plus,
  Upload,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function AdminDashboard() {
  const [exams, setExams] = useState([]);
  const [centers, setCenters] = useState([]);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [releaseTime, setReleaseTime] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchData = async () => {
    try {
      const [examResponse, centerResponse] = await Promise.all([
        api.get("/exams"),
        api.get("/centers"),
      ]);

      setExams(examResponse.data.exams || []);
      setCenters(centerResponse.data.centers || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      await api.post("/exams", {
        title,
        subject,
        examDate,
        startTime,
        duration: Number(duration),
        releaseTime,
      });

      setMessage("Exam created successfully.");

      setTitle("");
      setSubject("");
      setExamDate("");
      setStartTime("");
      setDuration("");
      setReleaseTime("");

      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishExam = async (examId) => {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      await api.patch(`/exams/${examId}/publish`);

      setMessage("Exam published successfully.");

      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish exam");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const publishedCount = exams.filter(
    (exam) => exam.status === "PUBLISHED",
  ).length;

  const draftCount = exams.filter((exam) => exam.status === "DRAFT").length;

  const filteredExams = exams.filter((exam) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    return (
      exam.title?.toLowerCase().includes(query) ||
      exam.subject?.toLowerCase().includes(query) ||
      exam.status?.toLowerCase().includes(query)
    );
  });

  const filteredCenters = centers.filter((center) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    return (
      center.name?.toLowerCase().includes(query) ||
      center.location?.toLowerCase().includes(query) ||
      center.userId?.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-shield">
            <ShieldCheck size={21} strokeWidth={1.8} />
          </div>

          <div>
            <h2>CipherExam</h2>
            <span>SECURE EXAM SYSTEM</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-item active">
            <LayoutDashboard size={17} strokeWidth={1.8} />
            Dashboard
          </a>

          <a href="#exams" className="nav-item">
            <CalendarDays size={17} strokeWidth={1.8} />
            Exams
          </a>

          <a href="#centers" className="nav-item">
            <Building2 size={17} strokeWidth={1.8} />
            Centers
          </a>

          <a href="#papers" className="nav-item">
            <FileKey2 size={17} strokeWidth={1.8} />
            Papers
          </a>

          <a href="#activity" className="nav-item">
            <ClipboardList size={17} strokeWidth={1.8} />
            Audit Logs
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="security-status">
            <div className="status-dot"></div>

            <div>
              <strong>System Secure</strong>
              <span>All services operational</span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-search">
            <Search size={16} strokeWidth={1.8} />

            <input
              type="text"
              placeholder="Search exams, centers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="topbar-right">
            <button className="notification-btn">
              <Bell size={18} strokeWidth={1.8} />
            </button>

            <div className="admin-profile">
              <div className="avatar">
                {(user.name || "A").charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{user.name || "Admin User"}</strong>
                <span>ADMIN</span>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content" id="dashboard">
          {/* HERO */}
          <section className="dashboard-heading">
            <div>
              <p className="eyebrow">EXAM AUTHORITY</p>

              <h1>Admin Dashboard</h1>

              <p>
                Manage examinations, secure question papers, authorized centers
                and system activity.
              </p>
            </div>

            <div className="security-badge">
              <ShieldCheck size={15} strokeWidth={1.8} />
              End-to-end protected
            </div>
          </section>

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

          {/* STATISTICS */}
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <CalendarDays size={19} strokeWidth={1.8} />
              </div>

              <div>
                <span>Total Exams</span>
                <strong>{exams.length}</strong>
                <small>
                  {publishedCount} published · {draftCount} draft
                </small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <Building2 size={19} strokeWidth={1.8} />
              </div>

              <div>
                <span>Exam Centers</span>
                <strong>{centers.length}</strong>
                <small>Registered centers</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <FileKey2 size={19} strokeWidth={1.8} />
              </div>

              <div>
                <span>Published Exams</span>
                <strong>{publishedCount}</strong>
                <small>Currently active</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon cyan">
                <ShieldCheck size={19} strokeWidth={1.8} />
              </div>

              <div>
                <span>Security</span>
                <strong>Active</strong>
                <small>AES · RSA · SHA-256</small>
              </div>
            </div>
          </section>

          {/* CREATE EXAM */}
          <section className="dashboard-card" id="create-exam">
            <div className="section-header">
              <div>
                <span className="section-label">EXAM MANAGEMENT</span>

                <h2>Create New Examination</h2>

                <p>Configure examination details and release time.</p>
              </div>

              <div className="section-icon">
                <Plus size={20} strokeWidth={1.8} />
              </div>
            </div>

            <form className="exam-form" onSubmit={handleCreateExam}>
              <div className="form-grid">
                <div className="form-field full">
                  <label>Exam Title</label>

                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Data Structures End Semester"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Subject</label>

                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Data Structures"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Exam Date</label>

                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Start Time</label>

                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Duration</label>

                  <div className="input-with-suffix">
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="180"
                      min="1"
                      required
                    />

                    <span>minutes</span>
                  </div>
                </div>

                <div className="form-field full">
                  <label>Paper Release Time</label>

                  <input
                    type="datetime-local"
                    value={releaseTime}
                    onChange={(e) => setReleaseTime(e.target.value)}
                    required
                  />

                  <small>Decryption remains blocked until this time.</small>
                </div>
              </div>

              <div className="form-footer">
                <div className="crypto-note">
                  <span>
                    <ShieldCheck size={18} strokeWidth={1.8} />
                  </span>

                  <div>
                    <strong>Security enforced</strong>
                    <p>
                      Release-time authorization is validated by the backend.
                    </p>
                  </div>
                </div>

                <button
                  className="primary-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    "Creating..."
                  ) : (
                    <>
                      <Plus size={16} strokeWidth={1.8} />
                      Create Examination
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* RECENT EXAMS */}
          <section className="dashboard-card" id="exams">
            <div className="section-header">
              <div>
                <span className="section-label">EXAM OVERVIEW</span>

                <h2>Recent Examinations</h2>

                <p>Monitor configured examinations and their status.</p>
              </div>

              <span className="count-pill">{filteredExams.length} exams</span>
            </div>

            <div className="exam-table-wrapper">
              <table className="exam-table">
                <thead>
                  <tr>
                    <th>EXAMINATION</th>
                    <th>SUBJECT</th>
                    <th>DATE</th>
                    <th>RELEASE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExams.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        No examinations created yet.
                      </td>
                    </tr>
                  ) : (
                    filteredExams.map((exam) => (
                      <tr key={exam._id}>
                        <td>
                          <div className="exam-name">
                            <div className="exam-file-icon">
                              <FileKey2 size={18} strokeWidth={1.8} />
                            </div>

                            <div>
                              <strong>{exam.title}</strong>
                              <span>{exam.duration} minutes</span>
                            </div>
                          </div>
                        </td>

                        <td>{exam.subject}</td>

                        <td>{new Date(exam.examDate).toLocaleDateString()}</td>

                        <td>{new Date(exam.releaseTime).toLocaleString()}</td>

                        <td>
                          <span
                            className={`status-pill ${
                              exam.status === "PUBLISHED"
                                ? "published"
                                : "draft"
                            }`}
                          >
                            <span></span>
                            {exam.status}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              exam.status === "PUBLISHED"
                                ? "published"
                                : "draft"
                            }`}
                          >
                            <span></span>
                            {exam.status}
                          </span>
                        </td>
                        <td>
                          {exam.status === "DRAFT" ? (
                            <button
                              className="publish-btn"
                              onClick={() => handlePublishExam(exam._id)}
                              disabled={loading}
                            >
                              <Send size={14} strokeWidth={1.8} />
                              Publish
                            </button>
                          ) : (
                            <span className="published-label">
                              <CheckCircle2 size={14} strokeWidth={1.8} />
                              Published
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* CENTER MANAGEMENT */}
          <section id="centers">
            <CenterManagement />
          </section>

          {/* PAPER MANAGEMENT */}
          <section id="papers">
            <PaperManagement />
          </section>

          <section id="audit-logs">
            <AuditLogs />
          </section>

          {/* ACTIVITY */}
          <section className="dashboard-card" id="activity">
            <div className="section-header">
              <div>
                <span className="section-label">SECURITY</span>

                <h2>Security Activity</h2>

                <p>
                  Security-sensitive operations are recorded through the backend
                  audit system.
                </p>
              </div>

              <div className="audit-icon">
                <Activity size={20} strokeWidth={1.8} />
              </div>
            </div>

            <div className="activity-placeholder">
              <div className="activity-shield">
                <CheckCircle2 size={21} strokeWidth={1.8} />
              </div>

              <div>
                <strong>Audit logging enabled</strong>

                <p>
                  Paper uploads, verification attempts, decryption attempts and
                  authentication events are recorded by CipherExam.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
