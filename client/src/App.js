import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import NotFound from "./components/NotFound";
import Home from "./pages/Home/Home";
import { fetchCurrentUser } from "./redux/authSlice";
import GlobalLoading from "./components/GlobalLoading";
import { useDispatch, useSelector } from "react-redux";
import Dashboard from "./Admin/Dashboard";
import ProtectedRoute from "./helpers/ProtectedRoute";
import AddCategory from "./Admin/Forms/AddCategory";
import AddProducts from "./Admin/Forms/AddProducts";
import DataTable from "./Admin/constants/DataTable";
import UserForm from "./Admin/Forms/UserForm";

const App = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

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
      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} /> {/* Default route for /admin */}
        <Route path="form/category" element={<AddCategory />} />
        <Route path="form/product" element={<AddProducts />} />
        <Route path="form/user" element={<UserForm />} />
        <Route path="management/users" element={<DataTable type="users" />} />
        <Route
          path="management/categories"
          element={<DataTable type="categories" />}
        />
        <Route
          path="management/products"
          element={<DataTable type="products" />}
        />
        <Route path="recycle-bin/users" element={<DataTable type="users" deleted={true} />} />
        <Route path="recycle-bin/categories" element={<DataTable type="categories" deleted={true} />} />
        <Route path="recycle-bin/products" element={<DataTable type="products" deleted={true} />} />
        <Route path="*" element={<NotFound />} />{" "}
        {/* Catch-all for undefined admin routes */}
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
