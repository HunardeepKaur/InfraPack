import React, { useEffect, useState, useRef } from "react";
import { FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "../../../source/modules/auth/views/AuthProvider";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js";

// ── Decryption Utilities (Keep your existing logic) ──
function hashKeyWithSHA256(key) {
  return CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(key));
}

const decryptAES256 = (encryptedText, key) => {
  try {
    const hashedKey = hashKeyWithSHA256(key);
    const parsedData = CryptoJS.enc.Base64.parse(encryptedText);
    const iv = CryptoJS.lib.WordArray.create(parsedData.words.slice(0, 4), 16);
    const encrypted = CryptoJS.lib.WordArray.create(
      parsedData.words.slice(4),
      parsedData.sigBytes - 16
    );

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted },
      hashedKey,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8) || "Error: Could not decrypt data";
  } catch (error) {
    console.error("Decryption error:", error.message);
    return "Error: Decryption failed";
  }
};

// ── Data Lists (Keep as-is) ──
const activePosition = ["Active", "Always", "Bussy", "Inactive", "Disabled", "Cutomization"];
const subscriptionsList = ["Plan", "Billings", "Referrals", "Payments", "Statements", "Subscriptions"];

// ── Color Mapping (Tailwind classes) ──
const getStatusColor = (item) => {
  const colors = {
    "Always": "bg-yellow-500",
    "Bussy": "bg-red-500",
    "Inactive": "bg-blue-500",
    "Disabled": "bg-gray-700",
    "Cutomization": "bg-indigo-600",
  };
  return colors[item] || "bg-green-500"; // Default: Active
};

const ProfileModal = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside (replaces Bootstrap's auto-close)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load user data (Keep your existing JWT + AES logic)
  useEffect(() => {
    const token = localStorage.getItem("login");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem("login");
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
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden focus:outline-none"
        type="button"
      >
        <img src="/images/Ellipse 1.svg" alt="Profile" className="w-full h-full object-cover" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[1030] animate-fade-in">
          
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h6 className="text-gray-900 font-semibold text-sm mb-0.5">
              {user?.fullName || "User"}
            </h6>
            <span className="text-xs text-gray-500 font-medium">
              {user?.emailid || "user@crm.com"}
            </span>
          </div>

          

          

          {/* Profile & Logout */}
          <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg mx-2 transition-colors">
            <FiUser className="text-gray-500" size={16} />
            <span>Profile Details</span>
          </a>
          <a href="#" onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mx-2 transition-colors">
            <FiLogOut size={16} />
            <span>Logout</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default ProfileModal;
