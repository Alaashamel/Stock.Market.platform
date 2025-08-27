// components/common/StockTicker/StockTicker.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';
import './StockTicker.css';

const StockTicker = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStockData = useCallback(async () => {
    try {
      const response = await api.get("/companies");
      
      const formattedStocks = response.data.map(company => ({
        symbol: company.tickerSymbol,
        name: company.name,
        price: company.lastStockPrice,
        shares: company.availableShares,
        volume: company.lastStockPrice * company.totalShares
      }));
      
      setStocks(formattedStocks);
    } catch (err) {
      // بيانات افتراضية للطوارئ
      setStocks([
        { symbol: 'AIDSF', name: 'ASDFS®', price: 321.20, shares: 32277, volume: 1032728.86 },
        { symbol: 'SMSNG', name: 'Samsung', price: 321.00, shares: 224, volume: 1017676.82 },
        { symbol: 'NVDA', name: 'NVIDIA', price: 221.24, shares: 2228, volume: 5138772.00 },
        { symbol: 'THATI', name: 'thaione', price: 231.00, shares: 22322, volume: 746878.92 },
        { symbol: 'MYCOX', name: 'yco', price: 324.60, shares: 34318, volume: 27000000.00 }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 30000);
    return () => clearInterval(interval);
  }, [fetchStockData]);

 
  return (
    <div className="stock-ticker-container">
      <div className="stock-ticker">
        {stocks.map((stock, index) => (
          <div key={index} className="stock-item">
            <span className="stock-symbol">{stock.symbol}</span>
            <span className="stock-name">{stock.name}</span>
            <span className="stock-price">${stock.price.toFixed(2)}</span>
            <span className="stock-shares">Shares: {stock.shares.toLocaleString()}</span>
            <span className="stock-volume">Vol: ${stock.volume.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockTicker;