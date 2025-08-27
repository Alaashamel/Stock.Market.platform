import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import "../../../index.css";
import useToast from "../../../hooks/useToast";
import Toast from "../../../components/common/Toast/Toast";

const TopNav = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [cashBalance, setCashBalance] = useState(0);
  const [portfolioSummary, setPortfolioSummary] = useState({
    cashBalance: 0,
    totalValue: 0,
    profit: 0,
    profitPercentage: 0,
  });
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get("/users/user_profile");
        setUsername(res.data.username);
        const balance = res.data.balance || 0;
        setCashBalance(balance);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        addToast("Failed to load user profile", "error");
      }
    };

    const fetchPortfolioSummary = async () => {
      try {
        const res = await api.get("/portfolio/my-portfolio/summary");
        setPortfolioSummary(res.data);
      } catch (err) {
        console.error("Failed to fetch portfolio summary", err);
        addToast("Failed to load portfolio summary", "error");
      }
    };

    fetchUserProfile();
    fetchPortfolioSummary();
  }, [addToast]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    addToast("Logged out successfully", "info");
    navigate("/login");
  };

  const { profit, profitPercentage } = portfolioSummary;

  return (
    <>
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

      <nav className="topnav">
        <div className="left-section">
          <img
            style={{ width: "70px", height: "40px", objectFit: "contain" }}
            src="https://www.efinance.com.eg/wp-content/uploads/2022/06/e-finance-logo-2.jpg"
            alt="e-finance logo"
          />
          <h1
            style={{ cursor: "pointer", color: "#000000FF" }}
            onClick={() => navigate("/")}
          >
            Invest
          </h1>
          <div className="nav-links">
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/portfolio")}>Portfolio</button>
            <button onClick={() => navigate("/transfers")}>Transfers</button>
            <button onClick={() => navigate("/profile")}>Profile</button>
          </div>
        </div>

        <div className="right-section">
          {username && (
            <span className="username">
              👋 Hello, <span className="username-bold">{username}</span>
            </span>
          )}

          <div className="financial-info-single-line">
            <div className="financial-item">
              <span className="icon">💰</span>
              <span className="label">Cash:</span>
              <span className="value cash-value">
                $
                {cashBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <span className="separator">|</span>

            <div className="financial-item">
              <span className="icon">📈</span>
              <span className="label">Profit:</span>
              <span
                className={`value ${profit >= 0 ? "positive" : "negative"}`}
              >
                $
                {profit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                <span className="percentage">
                  (
                  {profitPercentage.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  %)
                </span>
              </span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
    </>
  );
};

export default TopNav;
