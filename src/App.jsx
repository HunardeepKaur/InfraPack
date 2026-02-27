import { RouterProvider } from "react-router-dom";
import { router } from "./route/router";
import AuthProvider from "./source/modules/auth/views/AuthProvider";
import { Toaster } from "react-hot-toast";
import NavigationProvider from "./context/NavigationProvider";
import { appToastOptions } from "./components/shared/toast/appToast";


const App = () => {
  return (
    <AuthProvider>
      <NavigationProvider>
        <RouterProvider router={router} />
        <Toaster
          position={appToastOptions.position}
          toastOptions={appToastOptions}
          containerStyle={{
            top: 68,
            right: 16,
            zIndex: 11000,
          }}
        />
      </NavigationProvider>
    </AuthProvider>
  );
};

export default App;
