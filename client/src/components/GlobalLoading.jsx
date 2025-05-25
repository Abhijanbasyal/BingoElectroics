// components/GlobalLoading.jsx
import { PuffLoader } from 'react-spinners';

const GlobalLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary text-white flex-col space-y-6">
      {/* Your Company/Brand Name or Logo */}
      <h1 className="text-4xl font-bold">MyCompany</h1>

      {/* Spinner */}
      <PuffLoader color="#ffffff" size={60} />

      {/* Optional tagline */}
      <p className="text-lg opacity-70">Loading, please wait...</p>
    </div>
  );
};

export default GlobalLoading;
