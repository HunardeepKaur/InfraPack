import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const PageHeaderV2 = ({ children = [], list, backButton = true }) => {
  const navigate = useNavigate();

  return (
    <div className="page-header py-2" style={{ minHeight: "50px" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap w-100">

        {/* LEFT SIDE: Back button + Breadcrumbs */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {backButton && (
            <>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center rounded-circle ms-0"
                style={{ width: "35px", height: "35px", padding: "0" }}
              >
                <FiArrowLeft size={16} />
              </button>

              <div
                style={{
                  height: "30px",
                  width: "1px",
                  backgroundColor: "#ccc",
                  marginLeft: "12px",
                  marginRight: "12px",
                }}
              ></div>
            </>
          )}

          {/* Breadcrumbs */}
          <ul className="breadcrumb m-0 d-flex align-items-center gap-1">
            {children.map((item, index) => (
              <li
                key={index}
                className={`breadcrumb-item text-capitalize ${index === children.length - 1 ? "active" : ""}`}
                aria-current={index === children.length - 1 ? "page" : undefined}
              >
                {index === children.length - 1 ? (
                  item.pageName
                ) : item.path ? (
                  <Link to={item.path}>{item.folderName}</Link>
                ) : (
                  item.folderName
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT SIDE: Action Buttons */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {list}
        </div>
      </div>
    </div>
  );
};

export default PageHeaderV2;
