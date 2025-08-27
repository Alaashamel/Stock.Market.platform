import React, { useState, useEffect } from "react";
import "./Toast.css";

const Toast = ({ message, type, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // أيقونات حسب نوع الرسالة
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className={`toast ${type} ${isClosing ? "fade-out" : ""}`}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "18px" }}>{getIcon()}</span>
        <span>{message}</span>
      </div>
      <button onClick={handleClose}>&times;</button>
    </div>
  );
};

export default Toast;
