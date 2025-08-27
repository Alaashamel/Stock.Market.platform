import React from "react";
import "./Error404.css";

const Error404 = () => {
  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-graphic">
          <div className="error-astronaut">
            <div className="astronaut-helmet">
              <div className="astronaut-face">
                <div className="eyes">
                  <div className="left-eye"></div>
                  <div className="right-eye"></div>
                </div>
                <div className="mouth"></div>
              </div>
            </div>
          </div>
          <div className="error-planet"></div>
        </div>

        <div className="error-icon">
          <span className="error-number">4</span>
          <span className="error-zero">
            <div className="error-face">
              <div className="error-eyes"></div>
              <div className="error-mouth"></div>
            </div>
          </span>
          <span className="error-number">4</span>
        </div>

        <h1 className="error-title">Page Not Found</h1>
        <p className="error-message">
          Oops! The page you're looking for seems to have drifted off into
          space. It might have been moved, deleted, or never existed.
        </p>

        <div className="error-actions">
          <button
            className="error-button primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
          <button
            className="error-button secondary"
            onClick={() => (window.location.href = "/")}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error404;
