import { RouterProvider } from "react-router-dom";
import { router } from "./route/router";
import AuthProvider from "./source/modules/auth/views/AuthProvider";
import { Toaster } from "react-hot-toast";
import NavigationProvider from "./context/NavigationProvider";


const App = () => {
  return (
    <AuthProvider>
      <NavigationProvider>
        <RouterProvider router={router} />
        <Toaster toastOptions={{ duration: 2000 }} />
      </NavigationProvider>
    </AuthProvider>
  );
};

export default App;
