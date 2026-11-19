import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Fingerprint,
  LogIn,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const switchMode = () => {
    setIsRegister(!isRegister);

    setError("");
    setSuccess("");

    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // =========================
      // REGISTER
      // =========================

      if (isRegister) {
        if (!form.name.trim()) {
          throw new Error("Please enter your full name.");
        }

        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        if (form.password.length < 6) {
          throw new Error("Password must contain at least 6 characters.");
        }

        await api.post("/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });

        setSuccess("Account created successfully. You can now sign in.");

        setForm({
          name: "",
          email: form.email,
          password: "",
          confirmPassword: "",
          role: "STUDENT",
        });

        setIsRegister(false);

        return;
      }

      // =========================
      // LOGIN
      // =========================

      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "CENTER") {
        navigate("/center");
      } else {
        navigate("/student");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* =========================
          LEFT SECURITY PANEL
      ========================= */}

      <div className="login-visual">
        <div className="login-brand">
          <div className="login-brand-icon">
            <ShieldCheck size={21} strokeWidth={1.8} />
          </div>

          <div>
            <strong>CipherExam</strong>
            <span>SECURE EXAM SYSTEM</span>
          </div>
        </div>

        <div className="login-hero">
          <div className="login-eyebrow">SECURE EXAMINATION INFRASTRUCTURE</div>

          <h1>
            Protecting every
            <span> examination.</span>
          </h1>

          <p>
            A secure platform for encrypted examination papers, controlled
            access and verified distribution.
          </p>
        </div>

        <div className="login-security-list">
          <div className="login-security-item">
            <div className="login-security-icon">
              <LockKeyhole size={15} strokeWidth={1.8} />
            </div>
            <span>AES-256-GCM encrypted papers</span>
          </div>

          <div className="login-security-item">
            <div className="login-security-icon">
              <Fingerprint size={15} strokeWidth={1.8} />
            </div>
            <span>Digital signature verification</span>
          </div>

          <div className="login-security-item">
            <div className="login-security-icon">
              <UserRound size={15} strokeWidth={1.8} />
            </div>
            <span>Role-based access control</span>
          </div>

          <div className="login-security-item">
            <div className="login-security-icon">
              <ShieldCheck size={15} strokeWidth={1.8} />
            </div>
            <span>Time-controlled paper release</span>
          </div>
        </div>

        <div className="login-visual-footer">
          <span className="login-online-dot"></span>
          Secure infrastructure active
        </div>
      </div>

      {/* =========================
          RIGHT FORM
      ========================= */}

      <div className="login-form-area">
        <div className="mobile-login-brand">
          <div className="login-brand-icon">◆</div>

          <strong>CipherExam</strong>
        </div>

        <div className="login-form-container">
          <div className="login-heading">
            <div className="login-form-eyebrow">
              {isRegister ? "ACCOUNT REGISTRATION" : "SECURE AUTHENTICATION"}
            </div>

            <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>

            <p>
              {isRegister
                ? "Create your CipherExam account to access the examination system."
                : "Sign in to continue to your secure examination portal."}
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="login-error">
              <AlertCircle size={15} strokeWidth={1.8} />
              {error}
            </div>
          )}

          {success && (
            <div className="login-success">
              <CheckCircle2 size={15} strokeWidth={1.8} />
              {success}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {/* NAME */}

            {isRegister && (
              <div className="login-field">
                <label>FULL NAME</label>

                <div className="login-input-wrapper">
                  <span className="login-input-icon">
                    <UserRound size={16} strokeWidth={1.8} />
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            {/* EMAIL */}

            <div className="login-field">
              <label>EMAIL ADDRESS</label>

              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <Mail size={16} strokeWidth={1.8} />
                </span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* ROLE */}

            {isRegister && (
              <div className="login-field">
                <label>ACCOUNT TYPE</label>

                <div className="login-input-wrapper">
                  <span className="login-input-icon">
                    <UserRound size={16} strokeWidth={1.8} />
                  </span>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="STUDENT">Student</option>

                    <option value="CENTER">Examination Center</option>
                  </select>
                </div>
              </div>
            )}

            {/* PASSWORD */}

            <div className="login-field">
              <label>PASSWORD</label>

              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <LockKeyhole size={16} strokeWidth={1.8} />
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={16} strokeWidth={1.8} />
                  ) : (
                    <Eye size={16} strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            {isRegister && (
              <div className="login-field">
                <label>CONFIRM PASSWORD</label>

                <div className="login-input-wrapper">
                  <span className="login-input-icon">•</span>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}

            {/* LOGIN OPTIONS */}

            {!isRegister && (
              <div className="login-options">
                <label className="remember-option">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>

                <button type="button" className="forgot-password">
                  Forgot password?
                </button>
              </div>
            )}

            {/* SUBMIT */}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                "Please wait..."
              ) : (
                <>
                  <LogIn size={16} strokeWidth={1.8} />
                  {isRegister ? "Create Account" : "Sign In"}
                </>
              )}
            </button>
          </form>

          {/* SWITCH */}

          <div className="login-switch">
            {isRegister ? "Already have an account?" : "Don't have an account?"}

            <button type="button" onClick={switchMode}>
              {isRegister ? "Sign in" : "Create account"}
            </button>
          </div>

          {/* SECURITY NOTICE */}

          <div className="login-security-notice">
            <div className="login-notice-icon">
              <ShieldCheck size={19} strokeWidth={1.8} />
            </div>

            <div>
              <strong>Secure authentication</strong>

              <span>
                Your credentials are protected using encrypted authentication
                and secure session tokens.
              </span>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <span>© 2026 CipherExam</span>
          <span>Secure Examination Platform</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
