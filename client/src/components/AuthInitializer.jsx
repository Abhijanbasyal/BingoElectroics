import { useEffect } from 'react';
  import { useDispatch } from 'react-redux';
  import { fetchCurrentUser } from '../redux/authSlice';

  const AuthInitializer = () => {
    const dispatch = useDispatch();

    useEffect(() => {
      console.log('Dispatching fetchCurrentUser');
      dispatch(fetchCurrentUser()).then((result) => {
        console.log('fetchCurrentUser result:', result);
      }).catch((error) => {
        console.error('fetchCurrentUser error:', error);
      });
    }, [dispatch]);

    return null; // no UI
  };

  export default AuthInitializer;