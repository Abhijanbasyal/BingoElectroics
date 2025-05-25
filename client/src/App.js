
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Login from './auth/Login';
import Signup from './auth/Signup';
import NotFound from './components/NotFound';
import Home from './pages/Home/Home';
import { fetchCurrentUser } from './redux/authSlice';
import GlobalLoading from './components/GlobalLoading';
import { useDispatch, useSelector } from 'react-redux';




const App = () => {
  const dispatch = useDispatch();
  const {  user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Show loading screen globally on initial load
  if (loading && !user) {
    return <GlobalLoading />;
  }

  return (
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/not-found" element={<NotFound />} />
        </Route>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
};

export default App;