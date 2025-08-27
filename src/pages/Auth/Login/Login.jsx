import { useState } from "react";
import api from "../../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import useToast from "../../../hooks/useToast";
import Toast from "../../../components/common/Toast/Toast";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.username || !form.password) {
      addToast("Please enter both username and password", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/login", form, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", form.username);
        addToast("Login successful!", "success");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        addToast("Invalid response from server", "error");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        addToast(
          err.response.data?.message || `Server error: ${err.response.status}`,
          "error"
        );
      } else if (err.request) {
        addToast(
          "No response from server. Please check if the backend is running.",
          "error"
        );
      } else {
        addToast("Request error: " + err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div className="login-card">
        <div className="login-header">
          <img
            src="https://www.efinance.com.eg/wp-content/uploads/2022/06/e-finance-logo-2.jpg"
            alt="e-finance Logo"
            className="login-logo"
          />
          <h1 className="login-title">Welcome to E-Finance Invest</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="register-link">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
