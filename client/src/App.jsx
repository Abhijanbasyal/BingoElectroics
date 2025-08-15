import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "./redux/authSlice";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import SellerLayout from "./layouts/SellerLayout";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Profile from "./pages/Profile/Profile";
import NotFound from "./components/NotFound";
import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import Product from "./pages/Products/Product";
import Cart from "./pages/Products/Cart";
import Order from "./pages/Products/Order";
import EditProfile from "./pages/Profile/EditProfile";
import GlobalLoading from "./components/GlobalLoading";
import Dashboard from "./Admin/Dashboard";
import ManagerDashboard from "./Manager/ManagerDashboard";
import ProtectedRoute from "./helpers/ProtectedRoute";
import AddCategory from "./Admin/Forms/AddCategory";
import AddProducts from "./Admin/Forms/AddProducts";
import AddBanner from "./Admin/Forms/AddBanner";
import DataTable from "./Admin/constants/DataTable";
import UserForm from "./Admin/Forms/UserForm";
import EditForm from "./Admin/constants/EditForm";
import SellerAddProducts from "./Seller/Forms/AddProducts";
import SellerDataTable from "./Seller/constants/Datatable";
import SellerEditForm from "./Seller/constants/EditForms";
import AuthInitializer from "./components/AuthInitializer";

const DebugRoute = () => {
  const authState = useSelector((state) => state.auth);
  return <div>{JSON.stringify(authState)}</div>;
};

const Logout = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("Logging out...");
    dispatch(logoutUser()).then(() => {
      window.location.href = "/login";
    });
  }, [dispatch]);
  return null;
};

const App = () => {
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <AuthInitializer>
      {loading && <GlobalLoading />}
      {!loading && (
        <Routes>
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="/products/:id" element={<Product />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<Order />} />
            <Route path="/edit-profile" element={<EditProfile />} />
          </Route>
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="form">
              <Route path="category" element={<AddCategory />} />
              <Route path="product" element={<AddProducts />} />
              <Route path="banner" element={<AddBanner />} />
              <Route path="user" element={<UserForm />} />
            </Route>
            <Route path="form/edit/:type/:id" element={<EditForm />} />
            <Route path="management">
              <Route path="users" element={<DataTable type="users" />} />
              <Route path="categories" element={<DataTable type="categories" />} />
              <Route path="products" element={<DataTable type="products" />} />
              <Route path="banners" element={<DataTable type="banners" />} />
            </Route>
            <Route path="recycle-bin">
              <Route path="users" element={<DataTable type="users" deleted={true} />} />
              <Route path="categories" element={<DataTable type="categories" deleted={true} />} />
              <Route path="products" element={<DataTable type="products" deleted={true} />} />
              <Route path="banners" element={<DataTable type="banners" deleted={true} />} />
            </Route>
            <Route path="profile" element={<Profile />} />
            <Route path="logout" element={<Logout />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route
            path="/manager"
            element={
              <ProtectedRoute roles={["Manager"]}>
                <ManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ManagerDashboard />} />
            <Route path="form">
              <Route path="category" element={<AddCategory />} />
              <Route path="product" element={<AddProducts />} />
              <Route path="banner" element={<AddBanner />} />
              <Route path="user" element={<UserForm />} />
            </Route>
            <Route path="form/edit/:type/:id" element={<EditForm />} />
            <Route path="management">
              <Route path="users" element={<DataTable type="users" />} />
              <Route path="categories" element={<DataTable type="categories" />} />
              <Route path="products" element={<DataTable type="products" />} />
              <Route path="banners" element={<DataTable type="banners" />} />
            </Route>
            <Route path="recycle-bin">
              <Route path="users" element={<DataTable type="users" deleted={true} />} />
              <Route path="categories" element={<DataTable type="categories" deleted={true} />} />
              <Route path="products" element={<DataTable type="products" deleted={true} />} />
              <Route path="banners" element={<DataTable type="banners" deleted={true} />} />
            </Route>
            <Route path="profile" element={<Profile />} />
            <Route path="logout" element={<Logout />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route
            path="/seller"
            element={
              <ProtectedRoute roles={["Seller"]}>
                <SellerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="management/products" element={<SellerDataTable type="products" />} />
            <Route path="Forms/AddProduct" element={<SellerAddProducts />} />
            <Route path="Forms/edit/:type/:id" element={<SellerEditForm />} />
            <Route path="recycle-bin/products" element={<SellerDataTable type="products" deleted={true} />} />
            <Route path="profile" element={<Profile />} />
            <Route path="logout" element={<Logout />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/debug" element={<DebugRoute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </AuthInitializer>
  );
};

export default App;