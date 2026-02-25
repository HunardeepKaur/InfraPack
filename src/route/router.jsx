import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import RootLayout from "../components/layout/RootLayout.jsx";
// import TenderPage from "../pages/TenderPage.jsx";
import RFPDataViewer from "../source/modules/bidding/rfp/views/RFPDataViewer.jsx";
import { RFPProvider } from "../source/modules/bidding/rfp/context/RFPContext.jsx";
import RulesConfigurePage from "../pages/RulesConfigurePage.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/bidding/rfpdetails" replace /> },
      {
        path: "bidding/rfpdetails",
        element: (
          <RFPProvider>
            <RFPDataViewer />
          </RFPProvider>
        ),
      },
      { path: "configuration/rules-configure", element: <RulesConfigurePage /> },
    ],
  },
]);
