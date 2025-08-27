// components/common/PageLoader/PageLoader.jsx
import React from 'react';
import './PageLoader.css';

const PageLoader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="page-loader-overlay">
      <div className="page-loader">
        <div className="loader-spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default PageLoader;