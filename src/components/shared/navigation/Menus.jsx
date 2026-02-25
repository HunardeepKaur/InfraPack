import React from "react";
import { NavLink } from "react-router-dom";

const Menus = ({ sections, collapsed }) => {
  if (collapsed) {
    const items = sections.flatMap((section) => section.items);
    return (
      <div className="flex flex-col items-center gap-3 pt-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={`mini-${item.id}`}
              to={item.to}
              className={({ isActive }) =>
                `w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? "bg-white/20 text-white" : "text-white/85 hover:bg-white/10"
                }`
              }
              title={item.label}
            >
              <Icon size={18} />
            </NavLink>
          );
        })}
      </div>
    );
  }

  return (
    <div className="pt-1 divide-y divide-white/15">
      {sections.map((section, sectionIndex) => (
        <div key={section.id} className={sectionIndex === 0 ? "pb-4" : "pt-4 pb-2"}>
          <p className="text-sm font-semibold text-white/90 px-2 pb-2 leading-none">{section.title}</p>
          <div className="space-y-1.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                      isActive ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10"
                    }`
                  }
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Menus;

