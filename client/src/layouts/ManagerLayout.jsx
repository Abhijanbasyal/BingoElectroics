import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthInitializer from "../components/AuthInitializer";
import ManagerPanel from "../Manager/ManagerPanel/ManagerPanel";

const ManagerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-primary">
      <AuthInitializer />
      <Header />
      <Navbar />
      <ManagerPanel/>
      <Footer />
    </div>
  );
};

export default ManagerLayout;