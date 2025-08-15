import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '../redux/authSlice';
import Loading from './LoadingComponent';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token && !isAuthenticated) {
    
      dispatch(fetchCurrentUser())
        .then((result) => {
          
          setIsAuthReady(true);
        })
        .catch((error) => {
         
          if (error.payload?.message.includes('Unauthorized') || error.payload?.message.includes('No token found')) {
            localStorage.removeItem('token');
          }
          setIsAuthReady(true);
        });
    } else {
      
      setIsAuthReady(true);
    }
  }, [dispatch, isAuthenticated, token]); // Removed 'loading' to prevent re-runs

  if (!isAuthReady) {
    
    return <Loading />;
  }

  
  return <>{children}</>;
};

export default AuthInitializer;