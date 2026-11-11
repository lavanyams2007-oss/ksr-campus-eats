
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentAuth.css";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentAuth() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  function clearMessage() {
    setMessage("");
    setMessageType("");
  }

  function switchMode() {
    setMode((current) =>
      current === "login" ? "register" : "login"
    );
    setPassword("");
    clearMessage();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearMessage();

    // Validate only the fields required for the current mode.
    if (mode === "register" && !name.trim()) {
      setMessage("Please enter your full name.");
      setMessageType("error");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }

    if (!password) {
      setMessage("Please enter your password.");
      setMessageType("error");
      return;
    }

    if (mode === "register" && password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      setMessageType("error");
      return;
    }

    const endpoint =
      mode === "login"
        ? "/api/auth/login"
        : "/api/auth/register";

 const payload =
  mode === "login"
    ? {
        identifier: email.trim(),
        password,
      }
    : {
        fullName: name.trim(),
        studentId: studentId.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            (mode === "login"
              ? "Login failed. Check your email and password."
              : "Registration failed. Please check your details.")
        );
      }

      if (mode === "register") {
        setMode("login");
        setPassword("");
        setMessage(
          data.message ||
            "Registration successful! Please sign in with your account."
        );
        setMessageType("success");
        return;
      }

      // Accept common token response formats.
      const token =
        data.token ||
        data.accessToken ||
        data.data?.token;

      const student =
        data.student ||
        data.user ||
        data.data?.student ||
        data.data?.user;

      if (!token) {
        throw new Error(
          "Login response did not include an authentication token. Check your backend login response."
        );
      }

      sessionStorage.setItem("ksrStudentToken", token);

      if (student) {
        sessionStorage.setItem(
          "ksrStudent",
          JSON.stringify(student)
        );
      }

      navigate("/", { replace: true });
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to connect to the server. Check that your backend is running."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="student-auth-page">
      <button
        type="button"
        className="student-back-link"
        onClick={() => navigate("/")}
      >
        <span aria-hidden="true">←</span>
        Back to student website
      </button>

      <section className="student-auth-card">
        {/* Left-side branding panel */}
        <aside className="student-auth-hero">
          <div className="student-brand-mark" aria-hidden="true">
            🍽
          </div>

          <p className="student-eyebrow">
            KSR CAMPUS EATS
          </p>

          <h1>
            Your campus.
            <br />
            <span>Your cravings.</span>
          </h1>

          <p className="student-hero-copy">
            Fresh favourites, easy ordering, and more time
            to enjoy your break.
          </p>

          <div className="student-benefits">
            <div className="student-benefit">
              <span>01</span>
              <p>Order your favourite campus meals</p>
            </div>

            <div className="student-benefit">
              <span>02</span>
              <p>Skip the queue and save your break</p>
            </div>

            <div className="student-benefit">
              <span>03</span>
              <p>Track your order from kitchen to pickup</p>
            </div>
          </div>

          <div className="student-hero-footer">
            <span className="student-status-dot" />
            Made for the KSR student community
          </div>

          <div className="student-decor student-decor-one" />
          <div className="student-decor student-decor-two" />
        </aside>

        {/* Right-side form panel */}
        <section className="student-auth-form-panel">
          <div className="student-mobile-brand">
            <span aria-hidden="true">🍽</span>
            KSR Campus Eats
          </div>

          <div className="student-form-heading">
            <div className="student-form-icon" aria-hidden="true">
              ✦
            </div>

            <p className="student-eyebrow">
              STUDENT ACCESS
            </p>

            <h2>
              {mode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p>
              {mode === "login"
                ? "Sign in to order something delicious."
                : "Join in and make your next campus meal easy."}
            </p>
          </div>

          <form
            className="student-auth-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {mode === "register" && (
              <>
                <label htmlFor="student-name">
                  Full name
                </label>

                <input
                  id="student-name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    clearMessage();
                  }}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />

                <label htmlFor="student-id">
                  Student ID{" "}
                  <span className="student-optional">
                    (optional)
                  </span>
                </label>

                <input
                  id="student-id"
                  name="studentId"
                  type="text"
                  value={studentId}
                  onChange={(event) => {
                    setStudentId(event.target.value);
                    clearMessage();
                  }}
                  placeholder="Enter your student ID"
                />
              </>
            )}

            <label htmlFor="student-email">
              Email address
            </label>

            <input
              id="student-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearMessage();
              }}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <div className="student-password-label">
              <label htmlFor="student-password">
                Password
              </label>

              {mode === "login" && (
                <span>Keep it secure</span>
              )}
            </div>

            <div className="student-password-field">
              <input
                id="student-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearMessage();
                }}
                placeholder="Enter your password"
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                minLength={6}
                required
              />

              <button
                type="button"
                className="student-password-toggle"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {message && (
              <p
                className={`student-auth-message is-${messageType}`}
                role="alert"
              >
                {message}
              </p>
            )}

            <button
              className="student-submit-button"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Sign in to your account"
                    : "Create student account"}
              </span>

              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="student-switch-mode">
            {mode === "login"
              ? "New to KSR Campus Eats?"
              : "Already have an account?"}

            <button type="button" onClick={switchMode}>
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>

          <p className="student-auth-terms">
            Your account helps you access your campus food orders.
          </p>
        </section>
      </section>
    </main>
  );
}
