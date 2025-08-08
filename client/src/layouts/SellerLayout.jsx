import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthInitializer from "../components/AuthInitializer";
import SellerPanel from "../Seller/SellerPanel/SellerPanel";

const SellerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-primary">
      <AuthInitializer />
      <Header />
      <Navbar />
      <SellerPanel />
      <Footer />
    </div>
  );
};

export default SellerLayout;