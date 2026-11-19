import { useEffect, useState } from "react";
import api from "../services/api";
import {
  ShieldCheck,
  LayoutDashboard,
  FileText,
  FileCheck2,
  Download,
  UserCircle,
  LogOut,
  Search,
  Bell,
  Building2,
  CheckCircle2,
  AlertCircle,
  LockKeyhole,
  UnlockKeyhole,
  Clock3,
  FileKey2,
  CircleDot,
  KeyRound,
  ShieldAlert,
} from "lucide-react";

function CenterDashboard() {
  const [exams, setExams] = useState([]);
  const [papers, setPapers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date());

  const [verification, setVerification] = useState(null);
  const [decryption, setDecryption] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [examResponse, paperResponse] = await Promise.all([
        api.get("/exams/center"),
        api.get("/papers/center"),
      ]);

      setExams(examResponse.data.exams || []);
      setPapers(paperResponse.data.papers || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Failed to load center dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // VERIFY PAPER

  const handleVerify = async (paperId) => {
    try {
      const response = await api.post(`/papers/${paperId}/verify`);

      setVerification({
        success: true,
        title: "Paper Signature Valid",
        message:
          response.data?.message ||
          "The digital signature has been successfully verified.",
      });
    } catch (error) {
      setVerification({
        success: false,
        title: "Verification Failed",
        message:
          error.response?.data?.message ||
          "The paper signature could not be verified.",
      });
    }
  };

  // DECRYPT PAPER

  const handleDecrypt = async (paperId, fileName) => {
    try {
      setDecryption({
        status: "decrypting",
        fileName,
      });

      const response = await api.post(
        `/papers/${paperId}/decrypt`,
        {},
        {
          responseType: "blob",
        },
      );

      const blob = response.data;

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "question-paper.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setDecryption({
        status: "success",
        fileName: fileName || "question-paper.pdf",
      });
    } catch (error) {
      let message = "Unable to decrypt the question paper.";

      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const data = JSON.parse(text);
          message = data.message || message;
        } catch {
          message = "Something went wrong";
        }
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      setDecryption({
        status: "failed",
        message,
      });
    }
  };

  // LOGOUT

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="center-layout">
      <aside className="center-sidebar">
        <div className="center-brand">
          <div className="brand-shield">
            <ShieldCheck size={21} strokeWidth={1.8} />
          </div>

          <div>
            <h2>CipherExam</h2>
            <span>SECURE EXAM SYSTEM</span>
          </div>
        </div>

        <nav className="center-nav">
          <a href="#overview" className="center-nav-item active">
            <LayoutDashboard size={17} strokeWidth={1.8} />
            Dashboard
          </a>

          <a href="#assigned-exams" className="center-nav-item">
            <FileText size={17} strokeWidth={1.8} />
            My Exams
          </a>

          <a href="#verification" className="center-nav-item">
            <FileCheck2 size={17} strokeWidth={1.8} />
            Verify Paper
          </a>

          <a href="#downloads" className="center-nav-item">
            <Download size={17} strokeWidth={1.8} />
            Downloads
          </a>

          <a href="#profile" className="center-nav-item">
            <UserCircle size={17} strokeWidth={1.8} />
            My Profile
          </a>
        </nav>

        <div className="center-sidebar-bottom">
          <div className="center-secure-box">
            <ShieldCheck size={18} strokeWidth={1.8} />

            <div>
              <strong>Secure Connection</strong>

              <span>Protected session</span>
            </div>
          </div>

          <button className="center-logout" onClick={handleLogout}>
            <LogOut size={15} strokeWidth={1.8} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main className="center-main">
        {/* TOPBAR */}

        <header className="center-topbar">
          <div className="center-search">
            <Search size={16} strokeWidth={1.8} />
            <input placeholder="Search assigned examinations..." />
          </div>

          <div className="center-top-right">
            <button className="center-notification">
              <Bell size={17} strokeWidth={1.8} />
            </button>

            <div className="center-profile">
              <div className="center-avatar-top">
                {(user.name || "C").charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{user.name || "Center User"}</strong>

                <span>EXAM CENTER</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="center-content" id="overview">
          {/* PAGE HEADING */}

          <section className="center-heading">
            <div>
              <span className="center-eyebrow">EXAMINATION CENTER</span>

              <h1>My Assigned Exams</h1>

              <p>
                View authorized examinations and securely access question
                papers.
              </p>
            </div>

            <div className="center-security-badge">
              <CheckCircle2 size={15} strokeWidth={1.8} />
              Authorized Center
            </div>
          </section>

          {/* MESSAGES */}

          {message && <div className="center-success">✓ {message}</div>}

          {error && <div className="center-error">! {error}</div>}

          {/* SECURITY OVERVIEW*/}

          <section className="center-stats">
            <div className="center-stat">
              <div className="center-stat-icon blue">
                <FileText size={19} strokeWidth={1.8} />
              </div>

              <div>
                <span>Assigned Exams</span>

                <strong>{exams.length}</strong>
              </div>
            </div>

            <div className="center-stat">
              <div className="center-stat-icon purple">
                <FileKey2 size={19} strokeWidth={1.8} />
              </div>

              <div>
                <span>Question Papers</span>

                <strong>{papers.length}</strong>
              </div>
            </div>

            <div className="center-stat">
              <div className="center-stat-icon green">
                <ShieldCheck size={19} strokeWidth={1.8} />
              </div>

              <div>
                <span>Secure Access</span>

                <strong>Active</strong>
              </div>
            </div>

            <div className="center-stat">
              <div className="center-stat-icon cyan">
                <LockKeyhole size={19} strokeWidth={1.8} />
              </div>

              <div>
                <span>Protection</span>

                <strong>AES-256</strong>
              </div>
            </div>
          </section>

          {/* EXAMS */}

          <section className="assigned-exams-section" id="assigned-exams">
            <div className="center-section-heading">
              <div>
                <span>ASSIGNED EXAMINATIONS</span>

                <h2>Available Question Papers</h2>
              </div>

              <div className="center-exam-count">{exams.length} exams</div>
            </div>

            {loading ? (
              <div className="center-loading">
                Loading assigned examinations...
              </div>
            ) : exams.length === 0 ? (
              <div className="center-empty">
                <div>▣</div>

                <strong>No examinations assigned</strong>

                <p>
                  Your examination center does not currently have any assigned
                  exams.
                </p>
              </div>
            ) : (
              <div className="assigned-exam-grid">
                {exams.map((exam) => {
                  const paper = papers.find(
                    (p) => p.exam?._id?.toString() === exam._id.toString(),
                  );

                  const releaseTime = new Date(exam.releaseTime);

                  const now = new Date();

                  const released =
                    currentTime >= releaseTime && exam.status === "PUBLISHED";

                  return (
                    <article className="assigned-exam-card" key={exam._id}>
                      {/* CARD HEADER */}

                      <div className="exam-card-header">
                        <div className="exam-card-icon">
                          <FileText size={20} strokeWidth={1.8} />
                        </div>

                        <span
                          className={`center-status-badge ${
                            exam.status === "PUBLISHED" ? "published" : "draft"
                          }`}
                        >
                          <span></span>

                          {exam.status}
                        </span>
                      </div>

                      {/* TITLE */}

                      <h3>{exam.title}</h3>

                      <p className="exam-subject">{exam.subject}</p>

                      {/* EXAM INFO */}

                      <div className="exam-info-grid">
                        <div>
                          <span>EXAM DATE</span>

                          <strong>
                            {new Date(exam.examDate).toLocaleDateString()}
                          </strong>
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

                      {/* RELEASE TIME */}

                      <div
                        className={`release-box ${
                          released ? "released" : "locked"
                        }`}
                      >
                        <div className="release-icon">
                          {released ? (
                            <UnlockKeyhole size={20} strokeWidth={1.8} />
                          ) : (
                            <LockKeyhole size={20} strokeWidth={1.8} />
                          )}
                        </div>

                        <div>
                          <span>PAPER RELEASE TIME</span>

                          <strong>{releaseTime.toLocaleString()}</strong>
                        </div>
                      </div>

                      {/* PAPER */}

                      {paper ? (
                        <div className="paper-card">
                          <div className="paper-file">
                            <div className="pdf-icon">PDF</div>

                            <div>
                              <strong>{paper.originalName}</strong>

                              <span>Encrypted question paper</span>
                            </div>
                          </div>

                          <div
                            className={`paper-state ${
                              released ? "paper-released" : "paper-locked"
                            }`}
                          >
                            {released ? "● Paper Released" : "● Paper Locked"}
                          </div>
                        </div>
                      ) : (
                        <div className="no-paper">
                          <span>◌</span>
                          Paper not uploaded yet
                        </div>
                      )}

                      {/* ACTIONS */}

                      {paper && (
                        <div className="exam-actions">
                          <button
                            className="verify-btn"
                            onClick={() => handleVerify(paper._id)}
                          >
                            <FileCheck2 size={15} strokeWidth={1.8} />
                            Verify Paper
                          </button>

                          <button
                            className="decrypt-btn"
                            disabled={!released}
                            onClick={() =>
                              handleDecrypt(paper._id, paper.originalName)
                            }
                          >
                            {released ? (
                              <>
                                <Download size={15} strokeWidth={1.8} />
                                Decrypt & Download
                              </>
                            ) : (
                              <>
                                <LockKeyhole size={15} strokeWidth={1.8} />
                                Locked Until Release
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="center-dashboard-section" id="downloads">
            <div className="center-section-heading">
              <div>
                <span>SECURE DOCUMENTS</span>
                <h2>Downloads</h2>
              </div>

              <div className="center-exam-count">{papers.length} papers</div>
            </div>

            {papers.length === 0 ? (
              <div className="center-empty">
                <FileText size={28} strokeWidth={1.7} />

                <strong>No papers available</strong>

                <p>
                  Question papers assigned to this examination center will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="downloads-list">
                {papers.map((paper) => {
                  const exam = paper.exam;
                  const released =
                    exam &&
                    new Date() >= new Date(exam.releaseTime) &&
                    exam.status === "PUBLISHED";

                  return (
                    <div className="download-item" key={paper._id}>
                      <div className="download-item-icon">
                        <FileText size={20} strokeWidth={1.8} />
                      </div>

                      <div className="download-item-info">
                        <strong>{paper.originalName}</strong>

                        <span>{exam?.title || "Assigned Examination"}</span>
                      </div>

                      <div
                        className={`download-status ${
                          released ? "available" : "locked"
                        }`}
                      >
                        {released ? (
                          <>
                            <CheckCircle2 size={14} />
                            Available
                          </>
                        ) : (
                          <>
                            <LockKeyhole size={14} />
                            Locked
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="center-dashboard-section" id="profile">
            <div className="center-section-heading">
              <div>
                <span>ACCOUNT</span>
                <h2>My Profile</h2>
              </div>
            </div>

            <div className="center-profile-card">
              <div className="profile-large-avatar">
                {(user.name || "C").charAt(0).toUpperCase()}
              </div>

              <div className="profile-details">
                <div className="profile-detail">
                  <span>NAME</span>
                  <strong>{user.name || "Center User"}</strong>
                </div>

                <div className="profile-detail">
                  <span>EMAIL</span>
                  <strong>{user.email || "—"}</strong>
                </div>

                <div className="profile-detail">
                  <span>ROLE</span>
                  <strong>EXAMINATION CENTER</strong>
                </div>

                <div className="profile-detail">
                  <span>ACCOUNT STATUS</span>

                  <strong className="profile-active">
                    <CheckCircle2 size={14} />
                    ACTIVE
                  </strong>
                </div>
              </div>
            </div>
          </section>

          {/* SECURITY VERIFICATION */}

          <section className="verification-info-card" id="verification">
            <div className="verification-shield">
              <ShieldCheck size={28} strokeWidth={1.7} />
            </div>

            <div>
              <span>SECURITY VERIFICATION</span>

              <h2>Every paper is cryptographically verified</h2>

              <p>
                Before a question paper can be decrypted, CipherExam verifies
                your authorization, the paper signature and the configured
                release time.
              </p>
            </div>

            <div className="verification-points">
              <div>
                <CheckCircle2 size={15} strokeWidth={1.8} />
                Authorized Center
              </div>

              <div>
                <FileCheck2 size={15} strokeWidth={1.8} />
                Digital Signature
              </div>

              <div>
                <Clock3 size={15} strokeWidth={1.8} />
                Release Time
              </div>

              <div>
                <LockKeyhole size={15} strokeWidth={1.8} />
                AES Decryption
              </div>
            </div>
          </section>
        </div>
      </main>
      {verification && (
        <div
          className="verification-modal-overlay"
          onClick={() => setVerification(null)}
        >
          <div
            className="verification-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`verification-result-icon ${
                verification.success ? "success" : "failed"
              }`}
            >
              {verification.success ? (
                <CheckCircle2 size={38} strokeWidth={1.7} />
              ) : (
                <AlertCircle size={38} strokeWidth={1.7} />
              )}
            </div>

            <h2>{verification.title}</h2>

            <p className="verification-result-message">
              {verification.message}
            </p>

            <div className="verification-result-details">
              <div>
                <span>Verification Status</span>
                <strong
                  className={verification.success ? "verified" : "invalid"}
                >
                  {verification.success ? "VERIFIED" : "FAILED"}
                </strong>
              </div>

              <div>
                <span>Digital Signature</span>
                <strong>{verification.success ? "VALID" : "INVALID"}</strong>
              </div>

              <div>
                <span>Integrity Check</span>
                <strong>{verification.success ? "PASSED" : "FAILED"}</strong>
              </div>
            </div>

            <button
              className="verification-close-btn"
              onClick={() => setVerification(null)}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      {decryption && (
        <div
          className="verification-modal-overlay"
          onClick={() => {
            if (decryption.status !== "decrypting") {
              setDecryption(null);
            }
          }}
        >
          <div
            className="verification-modal decrypt-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {decryption.status === "decrypting" && (
              <>
                <div className="decrypt-loader">
                  <div className="decrypt-loader-ring"></div>
                </div>

                <h2>Decrypting Question Paper</h2>

                <p className="verification-result-message">
                  Your authorization has been verified. The encrypted paper is
                  being securely decrypted.
                </p>

                <div className="decrypt-status">
                  <div className="decrypt-status-row">
                    <span>Authorization</span>
                    <strong>VERIFIED</strong>
                  </div>

                  <div className="decrypt-status-row">
                    <span>Release Time</span>
                    <strong>VALID</strong>
                  </div>

                  <div className="decrypt-status-row">
                    <span>Encryption</span>
                    <strong>AES-256-GCM</strong>
                  </div>
                </div>
              </>
            )}

            {decryption.status === "success" && (
              <>
                <div className="verification-result-icon success">
                  <FileCheck2 size={38} strokeWidth={1.7} />
                </div>

                <h2>Paper Decrypted Successfully</h2>

                <p className="verification-result-message">
                  The question paper has been successfully decrypted and the PDF
                  download has started.
                </p>

                <div className="decrypt-success-file">
                  <span className="decrypt-file-icon">PDF</span>

                  <div>
                    <strong>{decryption.fileName}</strong>
                    <small>Securely decrypted document</small>
                  </div>
                </div>

                <div className="decrypt-security-badge">
                  <ShieldCheck size={15} strokeWidth={1.8} />
                  Secure decryption completed
                </div>

                <button
                  className="verification-close-btn"
                  onClick={() => setDecryption(null)}
                >
                  Done
                </button>
              </>
            )}

            {decryption.status === "failed" && (
              <>
                <div className="verification-result-icon failed">
                  <AlertCircle size={38} strokeWidth={1.7} />
                </div>

                <h2>Decryption Failed</h2>

                <p className="verification-result-message">
                  {decryption.message}
                </p>

                <button
                  className="verification-close-btn"
                  onClick={() => setDecryption(null)}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CenterDashboard;
