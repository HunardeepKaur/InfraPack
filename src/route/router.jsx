import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import RootLayout from "../components/layout/RootLayout.jsx";
// import TenderPage from "../pages/TenderPage.jsx";
import RFPDetails from "../source/modules/bidding/rfp/views/RFPDetails.jsx";
import { RFPProvider } from "../source/modules/bidding/rfp/context/RFPContext.jsx";
import RulesConfigure from "../source/modules/configuration/rulesConfigure/views/RulesConfigure.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RFPProvider>
        <RootLayout />
      </RFPProvider>
    ),
    children: [
      { index: true, element: <Navigate to="/bidding/rfpdetails" replace /> },
      {
        path: "bidding/rfpdetails",
        element: <RFPDetails />,
      },
      { path: "configuration/rules-configure", element: <RulesConfigure /> },
    ],
  },
]);
