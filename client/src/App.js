import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";


import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import SellerLayout from "./layouts/SellerLayout";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import NotFound from "./components/NotFound";
import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import Product from "./pages/Products/Product";
import Cart from "./pages/Products/Cart";
import { fetchCurrentUser } from "./redux/authSlice";
import GlobalLoading from "./components/GlobalLoading";
import { useDispatch, useSelector } from "react-redux";
import Dashboard from "./Admin/Dashboard";
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
        <Route path="/products/:id" element={<Product />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
      </Route>
      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} /> {/* Default route for /admin */}
        <Route path="form/category" element={<AddCategory />} />
        <Route path="form/product" element={<AddProducts />} />
        <Route path="form/banner" element={<AddBanner />} />
        <Route path="form/user" element={<UserForm />} />
        <Route path="form/edit/:type/:id" element={<EditForm />} />
        <Route path="management/users" element={<DataTable type="users" />} />
        <Route
          path="management/categories"
          element={<DataTable type="categories" />}
        />
        <Route
          path="management/products"
          element={<DataTable type="products" />}
        />
        <Route
          path="management/banners"
          element={<DataTable type="banners" />}
        />
        <Route
          path="recycle-bin/users"
          element={<DataTable type="users" deleted={true} />}
        />
        
        <Route
          path="recycle-bin/categories"
          element={<DataTable type="categories" deleted={true} />}
        />
        <Route
          path="recycle-bin/banners"
          element={<DataTable type="banners" deleted={true} />}
        />
        <Route
          path="recycle-bin/products"
          element={<DataTable type="products" deleted={true} />}
        />
        <Route path="*" element={<NotFound />} />{" "}
        {/* Catch-all for undefined admin routes */}
      </Route>
      <Route path="/seller" element={<SellerLayout />}>
        <Route path="management/products" element={<SellerDataTable type="products" />} />
        <Route path="Forms/AddProduct" element={<SellerAddProducts />} />
        <Route path="Forms/edit/:type/:id" element={<SellerEditForm />} />
        <Route path="recycle-bin/products" element={<SellerDataTable type="products" deleted={true} />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
