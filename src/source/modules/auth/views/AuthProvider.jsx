// src/source/modules/auth/views/AuthProvider.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { decryptAES256 } from "../../../common/common";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("login");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            localStorage.removeItem("login");
            setLoading(false);
            return;
          }

          const token_Data = decryptAES256(decodedToken.sessionData, "Laayn@2#Tech_");
          const parsedData = JSON.parse('{"guid":"3efc3f12-142d' + token_Data);
          setUser(parsedData);
        } catch (error) {
          console.error("Invalid token format", error);
          localStorage.removeItem("login");
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp < currentTime) {
        throw new Error("Token has expired");
      }

      const token_Data = decryptAES256(decodedToken.sessionData, "Laayn@2#Tech_");
      const parsedData = JSON.parse('{"guid":"3efc3f12-142d' + token_Data);
      setUser(parsedData);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("login");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default AuthProvider;