import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import TopNav from "../../components/common/TopNav/TopNav";
import StockTicker from "../../components/common/StockTicker/StockTicker";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import "./PortfolioPage.css";
import useToast from "../../hooks/useToast";
import Toast from "../../components/common/Toast/Toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [modal, setModal] = useState({ type: null, ticker: "", value: "" });
  const { toasts, addToast, removeToast } = useToast();

  const fetchPortfolio = async () => {
    try {
      const res = await api.get("/investments/portfolio");
      setPortfolio(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
      setError("Failed to fetch portfolio data");
      addToast("Failed to load portfolio data", "error");
      setLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const res = await api.get("/users/user_profile");
      setUserBalance(res.data.balance || 0);
    } catch (err) {
      console.error("Error fetching user balance:", err);
      addToast("Failed to load user balance", "error");
    }
  };

  useEffect(() => {
    fetchPortfolio();
    fetchUserBalance();
  }, []);

  const openModal = (type, ticker = "") =>
    setModal({ type, ticker, value: "" });
  const closeModal = () => setModal({ type: null, ticker: "", value: "" });

  const handleTrade = async (e) => {
    e.preventDefault();
    if (!modal.value || Number(modal.value) <= 0) {
      addToast("Please enter a valid amount/shares", "error");
      return;
    }

    try {
      let endpoint = "";
      let params = {};

      if (modal.type === "BUY") {
        endpoint = "/investments/invest/buy";
        params = {
          ticker: modal.ticker,
          amountUsd: Number(modal.value),
        };
      } else if (modal.type === "SELL") {
        endpoint = "/investments/invest/sell";
        params = {
          ticker: modal.ticker,
          sharesToSell: Math.floor(Number(modal.value)), // تحويل إلى عدد صحيح
        };
      }

      await api.post(endpoint, null, { params });
      addToast(`${modal.type} operation successful!`, "success");
      closeModal();
      fetchPortfolio();
      fetchUserBalance();
    } catch (err) {
      console.error(err);
      addToast(
        `${modal.type} failed: ${err.response?.data?.message || err.message}`,
        "error"
      );
    }
  };

  const handleAddBalance = async (e) => {
    e.preventDefault();
    const amount = prompt("Enter amount to add:");
    if (!amount || parseFloat(amount) <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    try {
      await api.post("/users/add_balance", null, {
        params: { amount: parseFloat(amount) },
      });
      fetchUserBalance();
      addToast("Balance added successfully!", "success");
    } catch (err) {
      console.error(err);
      addToast(
        "Error adding balance: " + (err.response?.data?.message || err.message),
        "error"
      );
    }
  };

  if (error)
    return (
      <div>
        <TopNav />
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    );

  const totalInvested = portfolio.reduce(
    (sum, inv) => sum + (inv.amountUsd || 0),
    0
  );
  const totalProfit = portfolio.reduce(
    (sum, inv) => sum + (inv.profit || 0),
    0
  );

  const lineChartData = {
    labels: portfolio.map((inv) => inv.tickerSymbol),
    datasets: [
      {
        label: "Profit (USD)",
        data: portfolio.map((inv) => inv.profit ?? 0),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const pieChartData = {
    labels: portfolio.map((inv) => inv.tickerSymbol),
    datasets: [
      {
        label: "Investment Distribution",
        data: portfolio.map((inv) => inv.amountUsd ?? 0),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8AC926",
          "#1982C4",
          "#6A4C93",
          "#F15BB5",
        ],
      },
    ],
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
      <StockTicker />
      <div className="container">
        <h1>My Portfolio</h1>

        <div className="summary-cards">
          <div className="card">
            <h3>Current Balance</h3>
            <p className="balance">
              $
              {userBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <button
                onClick={handleAddBalance}
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  fontSize: "12px",
                }}
              >
                Add
              </button>
            </p>
          </div>

          <div className="card">
            <h3>Total Invested</h3>
            <p>
              $
              {totalInvested.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="card">
            <h3>Total Profit/Loss</h3>
            <p className={totalProfit >= 0 ? "positive" : "negative"}>
              $
              {totalProfit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="card">
          <h2>Your Holdings</h2>
          {portfolio.length === 0 ? (
            <p>No investments yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Shares</th>
                    <th>Amount USD</th>
                    <th>Profit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.tickerSymbol}</td>
                      <td>
                        {(inv.sharesPurchased ?? 0).toLocaleString(undefined, {
                          minimumFractionDigits: 0, // تغيير إلى 0 لجعلها أعداد صحيحة
                          maximumFractionDigits: 0,
                        })}
                      </td>
                      <td>
                        $
                        {(inv.amountUsd ?? 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={
                          (inv.profit ?? 0) >= 0 ? "positive" : "negative"
                        }
                      >
                        $
                        {(inv.profit ?? 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <button
                          onClick={() => openModal("BUY", inv.tickerSymbol)}
                          style={{
                            marginRight: "5px",
                            padding: "5px 10px",
                            fontSize: "12px",
                          }}
                        >
                          Buy More
                        </button>
                        <button
                          onClick={() => openModal("SELL", inv.tickerSymbol)}
                          style={{
                            padding: "5px 10px",
                            fontSize: "12px",
                            background: "#dc2626",
                          }}
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Charts */}
        {portfolio.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              marginTop: "20px",
            }}
          >
            <div className="card" style={{ flex: "1", minWidth: "300px" }}>
              <h2>Profit by Stock</h2>
              <Line data={lineChartData} options={{ responsive: true }} />
            </div>

            <div className="card" style={{ flex: "1", minWidth: "300px" }}>
              <h2>Portfolio Distribution</h2>
              <Pie data={pieChartData} options={{ responsive: true }} />
            </div>
          </div>
        )}

        {/* Trade Modal */}
        {modal.type && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>
                {modal.type} {modal.ticker}
              </h2>
              <form onSubmit={handleTrade}>
                <label>
                  {modal.type === "BUY" ? "Amount (USD):" : "Shares to Sell:"}
                </label>
                <input
                  type="number"
                  min={modal.type === "BUY" ? "0.01" : "1"}
                  step={modal.type === "BUY" ? "0.01" : "1"}
                  value={modal.value}
                  onChange={(e) =>
                    setModal({ ...modal, value: e.target.value })
                  }
                  required
                  autoFocus
                />
                <div className="modal-buttons">
                  <button type="submit" className="buy-btn">
                    {modal.type}
                  </button>
                  <button type="button" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
