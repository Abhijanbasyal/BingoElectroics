import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProtectedRoute from "../helpers/ProtectedRoute";
import AuthInitializer from "../components/AuthInitializer";

const AdminLayout = () => {
  return (
    <ProtectedRoute requiredRole="Admin">
      <div className="flex flex-col min-h-screen bg-primary">
        <AuthInitializer />

        <Header />
        <Navbar />
        <main className="flex-1 container mx-auto p-4">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;
