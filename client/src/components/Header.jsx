import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="bg-primary text-fourth p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">MyApp</Link>
        <div>
          {user ? (
            <span className="text-lg">Welcome, {user.username}</span>
          ) : (
            <Link to="/login" className="text-tertiary hover:underline">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;