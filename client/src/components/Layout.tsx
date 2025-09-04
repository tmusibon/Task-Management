import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layaout: React.FC<LayoutProps> = ({ children }) => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <Link to="/">TaskMaster</Link>
        </div>
        <nav>
          {state.isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/tasks">Tasks</Link>
              <button onClick={handleLogout}>Logout</button>
              <span className="user-greeting">
                Hello, {state.user?.username}
              </span>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <p>
          &copy; {new Date().getFullYear()} TaskMaster. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Layaout;
