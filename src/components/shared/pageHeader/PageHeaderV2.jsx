import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const PageHeaderV2 = ({ children = [], list, backButton = true }) => {
  const navigate = useNavigate();

  return (
    <div className="py-2 bg-[#EDEEF0]" style={{ minHeight: "50px" }}>
      <div className="flex justify-between items-center flex-wrap w-full">

        {/* LEFT SIDE: Back button + Breadcrumbs */}
        <div className="flex items-center gap-2 flex-wrap">
          {backButton && (
            <>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center justify-center rounded-full border border-[#3E1067]/25 bg-white hover:bg-[#3E1067]/5 hover:border-[#3E1067]/50 transition-colors"
                style={{ width: "35px", height: "35px", padding: "0" }}
              >
                <FiArrowLeft size={16} className="text-[#3E1067]" />
              </button>

              <div className="w-px h-[30px] bg-[#3E1067]/15 mx-3"></div>
            </>
          )}

          {/* Breadcrumbs */}
          <ul className="flex items-center gap-1 m-0 list-none p-0">
            {children.map((item, index) => (
              <li
                key={index}
                className={`flex items-center text-sm ${
                  index === children.length - 1 
                    ? "text-[#3E1067] font-semibold" 
                    : "text-gray-400"
                }`}
                aria-current={index === children.length - 1 ? "page" : undefined}
              >
                {index > 0 && <span className="mx-1.5 text-gray-300">/</span>}
                {index === children.length - 1 ? (
                  <span>{item.pageName}</span>
                ) : item.path ? (
                  <Link 
                    to={item.path} 
                    className="hover:text-[#3E1067] transition-colors"
                  >
                    {item.folderName}
                  </Link>
                ) : (
                  <span>{item.folderName}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT SIDE: Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {list}
        </div>
      </div>
    </div>
  );
};

export default PageHeaderV2;
