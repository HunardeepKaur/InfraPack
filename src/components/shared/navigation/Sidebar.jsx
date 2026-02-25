import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigation } from "../../../context/NavigationProvider";
import Menus from "./Menus";
import { menuList } from "./menuList";

const Sidebar = () => {
  const { navigationExpanded, setNavigationExpanded } = useNavigation();

  return (
    <aside
      className="fixed top-14 left-0 h-[calc(100vh-56px)] z-[1022] overflow-x-hidden"
      style={{ width: navigationExpanded ? 260 : 60 }}
    >
      <div className="h-full rounded-tl-2xl rounded-r-xl overflow-x-hidden overflow-y-hidden shadow-sm text-white p-4 flex flex-col bg-gradient-to-b from-[#501E65] via-[#2B2751] to-[#0D0C14] font-sans">
        <div className="flex items-center justify-between">
          {navigationExpanded && (
            <p className="text-white text-sm font-semibold uppercase tracking-wide pl-1">Navigation</p>
          )}
          <div
            onClick={() => setNavigationExpanded((prev) => !prev)}
            className={`w-8 h-8 rounded-md text-white/90 hover:bg-white/15 flex items-center justify-center cursor-pointer select-none ${
              navigationExpanded ? "" : "mx-auto"
            }`}
            title={navigationExpanded ? "Collapse" : "Expand"}
            role="button"
            aria-label={navigationExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <FiChevronLeft className={navigationExpanded ? "" : "rotate-180"} />
          </div>
        </div>
        {navigationExpanded && <div className="h-px bg-white/20 my-4" />}

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Menus sections={menuList} collapsed={!navigationExpanded} />
        </div>

        {navigationExpanded && (
          <div
            className="mt-4 rounded-2xl p-4"
            style={{
              background: "linear-gradient(180deg, #FF6F61 0%, #EB773C 100%)",
            }}
          >
            <p className="text-white text-[18px] font-semibold text-center leading-none">Unlock all Features</p>
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                className="w-[148px] h-8 rounded-[8px] text-[18px] font-semibold text-[#2E2E30]"
                style={{ backgroundColor: "#F5EFE4" }}
              >
                Become Pro
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
