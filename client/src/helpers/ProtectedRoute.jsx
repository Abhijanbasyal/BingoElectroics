import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
// import LoadingComponent from '../components/LoadingComponent';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading, loadingAuthenticated } = useSelector((state) => state.auth);


  
  if (!user || !requiredRole.includes(user.roles)) {
    return <Navigate to="/" />;
  }
  return children;
};

export default ProtectedRoute; 