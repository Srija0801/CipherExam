import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import {
  ShieldCheck,
  LayoutDashboard,
  CalendarDays,
  UserCircle,
  LogOut,
  Search,
  GraduationCap,
  Fingerprint,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  FileText,
} from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get("/exams/student");
      setExams(response.data.exams || []);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const upcomingExams = exams.filter((exam) => {
    return exam.status === "PUBLISHED" && new Date(exam.examDate) >= new Date();
  });

  return (
    <div className="student-layout">
      {/* SIDEBAR */}

      <aside className="student-sidebar">
        <div className="student-brand">
          <div className="student-brand-icon">
            <ShieldCheck size={20} strokeWidth={1.8} />
          </div>

          <div>
            <strong>CipherExam</strong>
            <span>SECURE EXAM SYSTEM</span>
          </div>
        </div>

        <nav className="student-nav">
          <div className="student-nav-item active">
            <LayoutDashboard size={17} strokeWidth={1.8} />
            Dashboard
          </div>

          <div className="student-nav-item">
            <CalendarDays size={17} strokeWidth={1.8} />
            Exam Schedule
          </div>

          <div className="student-nav-item">
            <UserCircle size={17} strokeWidth={1.8} />
            My Profile
          </div>
        </nav>

        <div className="student-sidebar-bottom">
          <div className="student-security-card">
            <span className="security-dot"></span>

            <div>
              <strong>Secure Connection</strong>
              <small>Protected session</small>
            </div>
          </div>

          <button className="student-logout" onClick={logout}>
            <LogOut size={17} strokeWidth={1.8} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main className="student-main">
        <header className="student-topbar">
          <div className="student-search">
            <Search size={17} strokeWidth={1.8} />
            <input placeholder="Search examinations..." />
          </div>

          <div className="student-profile">
            <div className="student-avatar">
              {(user.name || "S").charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name || "Student"}</strong>
              <span>STUDENT</span>
            </div>
          </div>
        </header>

        <section className="student-content">
          <div className="student-heading">
            <div>
              <div className="student-eyebrow">STUDENT PORTAL</div>

              <h1>My Examination Schedule</h1>

              <p>
                View your upcoming examinations and important examination
                details.
              </p>
            </div>

            <div className="student-secure-badge">
              <ShieldCheck size={16} strokeWidth={1.8} />
              Secure Session
            </div>
          </div>

          {/* STATS */}

          <div className="student-stats">
            <div className="student-stat-card">
              <div className="student-stat-icon">
                <GraduationCap size={20} strokeWidth={1.8} />
              </div>

              <div>
                <span>Total Exams</span>
                <strong>{exams.length}</strong>
              </div>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-icon blue">
                <Clock3 size={20} strokeWidth={1.8} />
              </div>

              <div>
                <span>Upcoming</span>
                <strong>{upcomingExams.length}</strong>
              </div>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-icon green">
                <CheckCircle2 size={20} strokeWidth={1.8} />
              </div>

              <div>
                <span>Account Status</span>
                <strong>Active</strong>
              </div>
            </div>

            <div className="student-stat-card">
              <div className="student-stat-icon purple">
                <Fingerprint size={20} strokeWidth={1.8} />
              </div>

              <div>
                <span>Security</span>
                <strong>AES-256</strong>
              </div>
            </div>
          </div>

          {/* EXAMINATION LIST */}

          <section className="student-exams-section">
            <div className="student-section-header">
              <div>
                <div className="student-eyebrow">EXAMINATIONS</div>

                <h2>Upcoming Examinations</h2>
              </div>

              <span className="student-count">
                {upcomingExams.length} exams
              </span>
            </div>

            {loading ? (
              <div className="student-empty">
                Loading examination schedule...
              </div>
            ) : upcomingExams.length === 0 ? (
              <div className="student-empty">No upcoming examinations.</div>
            ) : (
              <div className="student-exam-grid">
                {upcomingExams.map((exam) => (
                  <div className="student-exam-card" key={exam._id}>
                    <div className="student-exam-card-top">
                      <div className="student-exam-icon">
                        <FileText size={20} strokeWidth={1.8} />
                      </div>
                      <span className="student-published">
                        <CheckCircle2 size={13} strokeWidth={2} />
                        PUBLISHED
                      </span>
                    </div>

                    <h3>{exam.title}</h3>

                    <p className="student-subject">{exam.subject}</p>

                    <div className="student-exam-details">
                      <div>
                        <span>EXAM DATE</span>
                        <strong>{formatDate(exam.examDate)}</strong>
                      </div>

                      <div>
                        <span>START TIME</span>
                        <strong>{exam.startTime}</strong>
                      </div>

                      <div>
                        <span>DURATION</span>
                        <strong>{exam.duration} min</strong>
                      </div>
                    </div>

                    <div className="student-exam-footer">
                      <div>
                        <span>Exam Status</span>

                        <strong>{exam.status}</strong>
                      </div>

                      <div className="student-locked">
                        <LockKeyhole size={18} strokeWidth={1.8} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECURITY NOTICE */}

          <section className="student-security-section">
            <div className="student-security-icon">
              <ShieldCheck size={23} strokeWidth={1.8} />
            </div>

            <div>
              <h3>Secure Examination Environment</h3>
              <p>
                Examination papers are protected using authenticated encryption
                and controlled access. Only authorized examination centers can
                access encrypted papers after their configured release time.
              </p>
            </div>

            <div className="student-security-status">
              <CheckCircle2 size={14} strokeWidth={1.8} />
              System Secure
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
