import { Outlet } from "react-router-dom";
import Header from "../shared/header/Header";
import Sidebar from "../../components/shared/navigation/Sidebar";
import { useNavigation } from "../../context/NavigationProvider";

const RootLayout = () => {
  const { navigationExpanded } = useNavigation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main
        className="pt-14 min-h-screen transition-all duration-300"
        style={{ paddingLeft: navigationExpanded ? 260 : 60 }}
      >
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RootLayout;