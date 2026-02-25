import { FiBriefcase, FiFileText, FiSliders } from "react-icons/fi";

export const menuList = [
  {
    id: "bidding",
    title: "Bidding",
    items: [
      
      { id: "rfp-details", label: "RFP Details", to: "/bidding/rfpdetails", icon: FiFileText },
    ],
  },
  {
    id: "configuration",
    title: "Configuration",
    items: [
      {
        id: "rules-configure",
        label: "Rules Configure",
        to: "/configuration/rules-configure",
        icon: FiSliders,
      },
    ],
  },
];

