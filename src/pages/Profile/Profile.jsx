import { useEffect, useState } from "react";
import api from "../../api/axios";
import TopNav from "../../components/common/TopNav/TopNav";
import StockTicker from "../../components/common/StockTicker/StockTicker";
import useToast from "../../hooks/useToast";
import Toast from "../../components/common/Toast/Toast";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get("/users/user_profile");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        addToast("Failed to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [addToast]);

  if (loading) {
    return (
      <div>
        <TopNav />
        <StockTicker />
        <div className="container">
          <div className="card">
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
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

      <TopNav />
      <StockTicker />
      <div className="container">
        <h2>Profile</h2>
        <div className="card">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <h3>Account Information</h3>
              <p>
                <strong>Username:</strong> {user?.username || "N/A"}
              </p>
              <p>
                <strong>Balance:</strong> $
                {user?.balance?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}
              </p>
            </div>

            <div>
              <h3>Account Actions</h3>
              <button
                onClick={() => (window.location.href = "/balance")}
                style={{
                  marginRight: "10px",
                  padding: "10px 20px",
                  background: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Add Balance
              </button>
              <button
                onClick={() => (window.location.href = "/transfers")}
                style={{
                  padding: "10px 20px",
                  background: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Transfer Money
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
