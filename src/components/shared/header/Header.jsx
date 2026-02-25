import React from "react";
import HeaderSearch from "./HeaderSearch.jsx";
import ProfileModal from "./ProfileModal.jsx";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#EDEEF0] border-b border-gray-300 z-[1025]">
      <div className="flex items-center justify-between h-full px-6 gap-5">
        <div className="flex items-center w-[190px] flex-shrink-0">
          <img src="/images/logo2.svg" alt="Laayn CRM" className="h-12 w-auto object-contain" />
        </div>

        <div className="flex-1 flex justify-start pl-4">
          <HeaderSearch />
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            className="h-8 px-3 rounded-lg border border-gray-300 bg-[#f1f1f2] text-[#2e2e30] text-sm font-medium flex items-center gap-2"
          >
            <img src="/images/LYA SYMBOL.svg" alt="" className="w-4 h-4" />
            <span>ASK LYA</span>
          </button>

          <button
            type="button"
            className="relative w-8 h-8 rounded-full bg-[#f1f1f2] border border-gray-300 flex items-center justify-center"
          >
            <img src="/images/notification.svg" alt="Notifications" className="w-5 h-5" />
            <span className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center leading-none">
              7
            </span>
          </button>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-[#f1f1f2] border border-gray-300 flex items-center justify-center"
          >
            <img src="/images/Expand.svg" alt="Expand" className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-[#f1f1f2] border border-gray-300 flex items-center justify-center"
          >
            <img src="/images/Moon.svg" alt="Theme" className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-[#f1f1f2] border border-gray-300 flex items-center justify-center"
          >
            <img src="/images/setting.svg" alt="Settings" className="w-5 h-5" />
          </button>

          <ProfileModal />
        </div>
      </div>
    </header>
  );
};

export default Header;
