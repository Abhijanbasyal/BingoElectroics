import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/authSlice';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <nav className="bg-secondary text-fourth p-4">
      <div className="container mx-auto flex space-x-4">
        <NavLink to="/" className={({ isActive }) => isActive ? "text-tertiary font-bold" : "hover:text-tertiary"}>Home</NavLink>
        {isAuthenticated && user?.roles === 'Admin' && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? "text-tertiary font-bold" : "hover:text-tertiary"}>Admin Dashboard</NavLink>
        )}
        {isAuthenticated && (
          <button onClick={handleLogout} className="hover:text-tertiary">Logout</button>
        )}
        {!isAuthenticated && (
          <>
            <NavLink to="/login" className={({ isActive }) => isActive ? "text-tertiary font-bold" : "hover:text-tertiary"}>Login</NavLink>
            <NavLink to="/signup" className={({ isActive }) => isActive ? "text-tertiary font-bold" : "hover:text-tertiary"}>Signup</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;