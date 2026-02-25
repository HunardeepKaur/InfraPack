import React, { createContext, useContext, useMemo, useState } from "react";

const NavigationContext = createContext(null);

const NavigationProvider = ({ children }) => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [navigationExpanded, setNavigationExpanded] = useState(true);

  const value = useMemo(
    () => ({
      navigationOpen,
      setNavigationOpen,
      navigationExpanded,
      setNavigationExpanded,
    }),
    [navigationOpen, navigationExpanded]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
};

export default NavigationProvider;
