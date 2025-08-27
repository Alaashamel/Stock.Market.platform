import { useState } from "react";
import api from "../../api/axios";
import TopNav from "../../components/common/TopNav/TopNav";
import useToast from "../../hooks/useToast";
import Toast from "../../components/common/Toast/Toast";

export default function AddBalance() {
  const [amount, setAmount] = useState("");
  const { toasts, addToast, removeToast } = useToast();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    try {
      await api.post("/users/add_balance", null, {
        params: { amount: parseFloat(amount) },
      });
      addToast("Balance added successfully!", "success");
      setAmount("");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Error adding balance:", err);
      addToast(
        "Failed to add balance: " +
          (err.response?.data?.message || err.message),
        "error"
      );
    }
  };

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
      <div className="container">
        <h2>Add Balance</h2>
        <div className="card">
          <form
            onSubmit={handleAdd}
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              min="0.01"
              step="0.01"
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Add Balance
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
