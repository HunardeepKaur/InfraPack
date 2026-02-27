import toast from "react-hot-toast";

const THEME_COLOR = "#3E1067";

export const appToastOptions = {
  duration: 2500,
  position: "top-right",
  style: {
    background: "#ffffff",
    color: "#1f2937",
    border: "1px solid #e5e7eb",
    borderLeft: `4px solid ${THEME_COLOR}`,
    borderRadius: "12px",
    padding: "12px 14px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
    fontSize: "13px",
    fontWeight: 500,
  },
  success: {
    duration: 2500,
    iconTheme: {
      primary: THEME_COLOR,
      secondary: "#ffffff",
    },
  },
  error: {
    duration: 3200,
    iconTheme: {
      primary: "#dc2626",
      secondary: "#ffffff",
    },
  },
};

export const appToast = {
  success: (message, options = {}) => toast.success(message, options),
  error: (message, options = {}) => toast.error(message, options),
  info: (message, options = {}) =>
    toast(message, {
      icon: "i",
      ...options,
    }),
  loading: (message, options = {}) => toast.loading(message, options),
  dismiss: (id) => toast.dismiss(id),
};

export default appToast;
