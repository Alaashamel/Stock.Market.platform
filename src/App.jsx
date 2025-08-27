import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Profile from "./pages/Profile/Profile";
import AddBalance from "./pages/AddBalance/AddBalance";
import Transfers from "./pages/Transfers/Transfers";
import PortfolioPage from "./pages/Portfolio/PortfolioPage";
import MainPage from "./pages/MainPage";
import PageLoader from "./components/common/PageLoader/PageLoader";
import Error404 from "./pages/Error/Error404";
import "./index.css";

function AppContent() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className="App">
      <PageLoader isLoading={isLoading} />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/balance" element={<AddBalance />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
