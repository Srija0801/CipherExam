import { useEffect, useState } from "react";
import api from "../services/api";

import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock3,
  ShieldCheck,
} from "lucide-react";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get("/audit");
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getActionLabel = (action) => {
    return action.replaceAll("_", " ");
  };

  return (
    <section className="audit-management-card">
      <div className="audit-header">
        <div>
          <div className="section-eyebrow">SECURITY MONITORING</div>

          <h2>Audit Logs</h2>

          <p>
            Track authentication, paper verification, uploads and decryption
            activity.
          </p>
        </div>

        <div className="audit-live-badge">
          <Activity size={15} strokeWidth={1.8} />
          Audit Active
        </div>
      </div>

      {loading ? (
        <div className="audit-loading">
          <Activity size={17} strokeWidth={1.8} />
          Loading security activity...
        </div>
      ) : logs.length === 0 ? (
        <div className="audit-empty">
          <ShieldCheck size={17} strokeWidth={1.8} />
          No audit activity recorded yet.
        </div>
      ) : (
        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>User</th>
                <th>Exam</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <span className="audit-action">
                      {getActionLabel(log.action)}
                    </span>
                  </td>

                  <td>
                    <div className="audit-user">
                      <strong>{log.userId?.name || "Unknown User"}</strong>

                      <small>{log.userId?.email || "—"}</small>
                    </div>
                  </td>

                  <td>
                    <div className="audit-exam">{log.examId?.title || "—"}</div>
                  </td>

                  <td>
                    <span
                      className={`audit-status ${
                        log.success ? "success" : "failed"
                      }`}
                    >
                      {log.success ? (
                        <CheckCircle2 size={15} strokeWidth={1.8} />
                      ) : (
                        <XCircle size={15} strokeWidth={1.8} />
                      )}

                      {log.success ? "SUCCESS" : "FAILED"}
                    </span>
                  </td>

                  <td>
                    <span className="audit-time">
                      <Clock3 size={14} strokeWidth={1.8} />
                      {formatDate(log.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AuditLogs;
