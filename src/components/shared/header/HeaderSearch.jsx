import React from "react";
import { FiSearch } from "react-icons/fi";

const HeaderSearch = ({ onSearch }) => {
  return (
    <div className="w-[340px] h-9 bg-[#FAFAFA] rounded-full flex items-center px-4 border border-[#EDEEF0] cursor-text hover:bg-gray-100 transition-colors">
      <FiSearch size={16} className="text-gray-400 mr-2 flex-shrink-0" />
      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => onSearch?.(e.target.value)}
        className="flex-1 border-0 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 focus:ring-0 w-full min-w-0"
      />
    </div>
  );
};

export default HeaderSearch;
