import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary text-fourth">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-4">Page Not Found</p>
        <Link to="/" className="text-tertiary hover:underline">Go to Home</Link>
      </div>
    </div>
  );
};

export default NotFound;