import { useState } from "react";
import api from "../../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import useToast from "../../../hooks/useToast";
import Toast from "../../../components/common/Toast/Toast";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "investor",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.role
    ) {
      addToast("Please fill in all fields", "error");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) {
      addToast("Please enter a valid email address", "error");
      return;
    }

    if (form.password.length < 6) {
      addToast("Password must be at least 6 characters", "error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);

    try {
      // استخدام destructuring بدون تعيين confirmPassword لمتغير
      const { confirmPassword: _, ...submitData } = form;

      // تحويل قيمة role إلى UPPERCASE قبل الإرسال
      const dataToSend = {
        ...submitData,
        role: submitData.role.toUpperCase(),
      };

      await api.post("/auth/register", dataToSend);
      addToast("Account created successfully! Please login.", "success");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      addToast(
        err.response?.data?.message || "Registration failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
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

      <div className="register-card">
        <div className="register-header">
          <img
            src="https://www.efinance.com.eg/wp-content/uploads/2022/06/e-finance-logo-2.jpg"
            alt="e-finance Logo"
            className="register-logo"
          />
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Join E-Finance Invest today</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password (min. 6 characters)"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select account type</option>
              <option value="investor">Investor</option>
              <option value="company">Company</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="register-button">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="login-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
