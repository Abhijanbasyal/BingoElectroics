import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthInitializer from "../components/AuthInitializer";
import AdminPanel from "../Admin/AdminPanel/AdminPanel";

const AdminLayout = () => {
  return (
      <div className="flex flex-col min-h-screen bg-primary">
        <AuthInitializer />

        <Header />
        <Navbar />
        <AdminPanel/>
        {/* <main className="flex-1 container mx-auto p-4">
          <Outlet />
        </main> */}
        <Footer />
      </div>
  );
};

export default AdminLayout;
