
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowLeft,
} from "lucide-react";
import "./AdminLogin.css";

const API_URL = "http://localhost:5000";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        throw new Error(
          data.message || "Invalid email or password. Please try again."
        );
      }

      // Save the real backend JWT token
      sessionStorage.setItem("ksrAdminToken", data.token);
      sessionStorage.setItem("ksrAdmin", JSON.stringify(data.admin));

      // Remove the old demo session
      sessionStorage.removeItem("ksrAdminDemoSession");

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Please check whether the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <button
        className="admin-back-button"
        onClick={() => navigate("/")}
        type="button"
      >
        <ArrowLeft size={18} />
        Back to Student Website
      </button>

      <section className="admin-login-layout">
        <div className="admin-login-brand-panel">
          <div className="admin-brand-logo">
            <UtensilsCrossed size={27} />
          </div>

          <p className="admin-eyebrow">KSR CAMPUS EATS</p>
          <h1>
            Your canteen.
            <br />
            <span>Your control.</span>
          </h1>

          <p className="admin-brand-description">
            Manage orders, organize your menu, and keep every
            campus meal running smoothly.
          </p>

          <div className="admin-feature-list">
            <div>
              <span>01</span>
              <p>Real-time order management</p>
            </div>
            <div>
              <span>02</span>
              <p>Food menu administration</p>
            </div>
            <div>
              <span>03</span>
              <p>Campus canteen insights</p>
            </div>
          </div>

          <p className="admin-brand-footer">
            MADE FOR YOUR CAMPUS · KSR CAMPUS EATS
          </p>
        </div>

        <div className="admin-login-form-panel">
          <div className="admin-login-mobile-logo">
            <UtensilsCrossed size={24} />
            <span>KSR Campus Eats</span>
          </div>

          <div className="admin-security-icon">
            <ShieldCheck size={27} />
          </div>

          <p className="admin-form-eyebrow">ADMINISTRATION</p>
          <h2>Welcome back</h2>
          <p className="admin-form-description">
            Sign in to access your canteen dashboard.
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="admin-email">Admin email</label>
            <div className="admin-input-wrap">
              <Mail size={19} />
              <input
                id="admin-email"
                type="email"
                placeholder="admin@ksr.edu"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <label htmlFor="admin-password">Password</label>
            <div className="admin-input-wrap">
              <LockKeyhole size={19} />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {error && (
              <p className="admin-login-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="admin-submit-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in to dashboard"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="admin-form-footer">
            Authorized canteen administrators only.
          </p>
        </div>
      </section>
    </main>
  );
}
