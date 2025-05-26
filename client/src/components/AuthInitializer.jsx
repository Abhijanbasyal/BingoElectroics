// components/AuthInitializer.jsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../redux/authSlice';

const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('Dispatching fetchCurrentUser');
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return null; // no UI
};

export default AuthInitializer;
