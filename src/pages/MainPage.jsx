import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "../MainPage.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import TopNav from "../components/common/TopNav/TopNav";
import useToast from "../hooks/useToast";
import Toast from "../components/common/Toast/Toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MainPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState({});
  const [modal, setModal] = useState({ type: null, company: null, value: "" });
  const { toasts, addToast, removeToast } = useToast();

  // sorting state
  const [sortBy, setSortBy] = useState("change");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get("/companies");
        setCompanies(response.data);

        const allHistory = {};
        await Promise.all(
          response.data.map(async (company) => {
            try {
              const hist = await api.get(
                `/api/stock-history/${company.tickerSymbol}`
              );
              allHistory[company.tickerSymbol] = hist.data;
            } catch (err) {
              // إذا فشل جلب التاريخ، استخدم سعر الشركة الحالي كبيانات افتراضية
              allHistory[company.tickerSymbol] = [
                {
                  stockPrice: company.lastStockPrice,
                  priceDate: new Date().toISOString(),
                },
              ];
            }
          })
        );
        setHistoryData(allHistory);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching companies or history:", error);
        addToast("Failed to load companies data", "error");
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [addToast]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (ctx) =>
            `$${ctx.raw.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
        },
      },
    },
    interaction: { mode: "nearest", intersect: false },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#555" } },
      y: {
        grid: { color: "rgba(200,200,200,0.2)" },
        ticks: { color: "#555" },
      },
    },
  };

  const openModal = (type, company) => setModal({ type, company, value: "" });
  const closeModal = () => setModal({ type: null, company: null, value: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!modal.value || Number(modal.value) <= 0) {
        addToast("Please enter a valid amount/shares", "error");
        return;
      }

      let endpoint = "";
      let params = {};

      if (modal.type === "BUY") {
        endpoint = "/investments/invest/buy";
        params = {
          ticker: modal.company.tickerSymbol,
          amountUsd: Number(modal.value),
        };
      } else if (modal.type === "SELL") {
        endpoint = "/investments/invest/sell";
        params = {
          ticker: modal.company.tickerSymbol,
          sharesToSell: Number(modal.value),
        };
      }

      await api.post(endpoint, null, { params });
      addToast(`${modal.type} successful!`, "success");
      closeModal();
    } catch (err) {
      console.error(err);
      addToast(
        `${modal.type} failed: ${err.response?.data?.message || err.message}`,
        "error"
      );
    }
  };

  // sorting logic
  const sortedCompanies = [...companies].sort((a, b) => {
    const chartInfoA = historyData[a.tickerSymbol] || [];
    const chartInfoB = historyData[b.tickerSymbol] || [];

    const prevPriceA =
      chartInfoA.length > 1
        ? chartInfoA[chartInfoA.length - 2].stockPrice
        : a.lastStockPrice;
    const prevPriceB =
      chartInfoB.length > 1
        ? chartInfoB[chartInfoB.length - 2].stockPrice
        : b.lastStockPrice;

    const changeA = a.lastStockPrice - prevPriceA;
    const changePercentA = prevPriceA !== 0 ? (changeA / prevPriceA) * 100 : 0;

    const changeB = b.lastStockPrice - prevPriceB;
    const changePercentB = prevPriceB !== 0 ? (changeB / prevPriceB) * 100 : 0;

    let valA, valB;

    switch (sortBy) {
      case "price":
        valA = a.lastStockPrice;
        valB = b.lastStockPrice;
        break;
      case "valuation":
        valA = a.lastStockPrice * a.totalShares;
        valB = b.lastStockPrice * b.totalShares;
        break;
      case "change":
        valA = changePercentA;
        valB = changePercentB;
        break;
      case "ticker":
      default:
        return a.tickerSymbol.localeCompare(b.tickerSymbol);
    }

    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  // helper for clickable headers
  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
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

      {/* 🔝 Auto-scrolling Top Slider */}
      <div className="top-slider">
        <div className="top-slider-track">
          {companies.map((company) => (
            <div
              key={company.id}
              className="top-slider-card"
              onClick={() => openModal("BUY", company)}
            >
              <span className="ticker">{company.tickerSymbol}</span>
              <span className="price">
                $
                {company.lastStockPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <TopNav />

      <div className="main-container">
        {/* 🔄 Auto-sliding Company Cards */}
        <div className="cards-slider">
          <div className="cards-slider-track">
            {companies.map((company) => {
              const chartInfo = historyData[company.tickerSymbol] || [];
              const chartData = {
                labels: chartInfo.map((h) =>
                  new Date(h.priceDate).toLocaleDateString()
                ),
                datasets: [
                  {
                    label: "Price",
                    data: chartInfo.map((h) => h.stockPrice),
                    borderColor: "rgb(75,192,192)",
                    backgroundColor: (ctx) => {
                      const chart = ctx.chart;
                      const { ctx: c, chartArea } = chart;
                      if (!chartArea) return null;
                      const gradient = c.createLinearGradient(
                        0,
                        chartArea.bottom,
                        0,
                        chartArea.top
                      );
                      gradient.addColorStop(0, "rgba(75,192,192,0.1)");
                      gradient.addColorStop(1, "rgba(75,192,192,0.4)");
                      return gradient;
                    },
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                  },
                ],
              };

              return (
                <div className="company-card" key={company.id}>
                  <h2>
                    {company.name} ({company.tickerSymbol})
                  </h2>
                  <p>
                    Last Price: $
                    {company.lastStockPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p>Available Shares: {company.availableShares}</p>
                  <p>
                    Valuation: $
                    {(
                      company.lastStockPrice * company.totalShares
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div className="chart-container" style={{ height: "200px" }}>
                    {chartInfo.length > 0 ? (
                      <Line data={chartData} options={chartOptions} />
                    ) : (
                      <p>Loading chart data...</p>
                    )}
                  </div>
                  <div className="card-buttons">
                    <button
                      className="buy-btn"
                      onClick={() => openModal("BUY", company)}
                    >
                      Buy
                    </button>
                    <button
                      className="sell-btn"
                      onClick={() => openModal("SELL", company)}
                    >
                      Sell
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 📊 Companies Table */}
        <table className="companies-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("ticker")}>Ticker</th>
              <th>Name</th>
              <th onClick={() => handleSort("price")}>Last Price</th>
              <th>Available Shares</th>
              <th onClick={() => handleSort("valuation")}>Valuation</th>
              <th onClick={() => handleSort("change")}>Price Change</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCompanies.map((company) => {
              const chartInfo = historyData[company.tickerSymbol] || [];
              const previousPrice =
                chartInfo.length > 1
                  ? chartInfo[chartInfo.length - 2].stockPrice
                  : company.lastStockPrice;
              const change = company.lastStockPrice - previousPrice;
              const changePercent =
                previousPrice !== 0 ? (change / previousPrice) * 100 : 0;

              return (
                <tr key={company.id}>
                  <td>{company.tickerSymbol}</td>
                  <td>{company.name}</td>
                  <td>
                    $
                    {company.lastStockPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>{company.availableShares}</td>
                  <td>
                    $
                    {(
                      company.lastStockPrice * company.totalShares
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td style={{ color: change >= 0 ? "green" : "red" }}>
                    {change >= 0 ? "+" : ""}
                    {change.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    ({changePercent.toFixed(2)}%)
                  </td>
                  <td>
                    <button
                      className="buy-btn"
                      onClick={() => openModal("BUY", company)}
                    >
                      Buy
                    </button>
                    <button
                      className="sell-btn"
                      onClick={() => openModal("SELL", company)}
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 🛒 Buy/Sell Modal */}
        {modal.type && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>
                {modal.type} {modal.company.name}
              </h2>
              <form onSubmit={handleSubmit}>
                <label>
                  {modal.type === "BUY" ? "Amount (USD):" : "Shares:"}
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={modal.value}
                  onChange={(e) =>
                    setModal({ ...modal, value: e.target.value })
                  }
                  required
                />
                <div className="modal-buttons">
                  <button type="submit" className="buy-btn">
                    {modal.type}
                  </button>
                  <button
                    type="button"
                    className="sell-btn"
                    onClick={closeModal}
                  >
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

export default MainPage;
