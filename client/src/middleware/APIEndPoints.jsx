const serverDomain = process.env.REACT_APP_SERVER_DOMAIN;

const APIEndPoints = {
  signUp: {
    url: `${serverDomain}/auth/signup`,
    method: "post",
  },
  register: {
    url: `${serverDomain}/auth/register`,
    method: "post",
  },
  login: {
    url: `${serverDomain}/auth/login`,
    method: "post",
  },
  logout: {
    url: `${serverDomain}/auth/logout`,
    method: "post",
  },
  currentUser: {
    url: `${serverDomain}/auth/current-user`,
    method: "get",
  },
  updateProfile: {
    url: `${serverDomain}/auth/edit-profile`,
    method: "put",
  },
  getUserById: {
    url: `${serverDomain}/auth/users/:id`,
    method: "get",
  },
  updateUser: {
    url: `${serverDomain}/auth/users/:id`,
    method: "put",
  },
  checkUnique: {
    url: `${serverDomain}/auth/register/check-unique`,
    method: "post",
  },
  checkUniqueFields: {
    url: `${serverDomain}/auth/users/:id/check-unique`,
    method: "post",
  },
  Add_category: {
    url: `${serverDomain}/categories`,
    method: "post",
  },
  Get_categories: {
    url: `${serverDomain}/categories`,
    method: "get",
  },
  getCategoryById: {
    url: `${serverDomain}/categories/:id`,
    method: "get",
  },
  updateCategory: {
    url: `${serverDomain}/categories/:id`,
    method: "put",
  },
  Add_product: {
    url: `${serverDomain}/products`,
    method: "post",
  },
  Get_products: {
    url: `${serverDomain}/products`,
    method: "get",
  },
  getProductById: {
    url: `${serverDomain}/products/:id`,
    method: "get",
  },
  updateProduct: {
    url: `${serverDomain}/products/:id`,
    method: "put",
  },
  Get_users: {
    url: `${serverDomain}/auth/users`,
    method: "get",
  },
  Get_deleted_users: {
    url: `${serverDomain}/auth/users/deleted`,
    method: "get",
  },
  Restore_user: {
    url: `${serverDomain}/auth/users/:id/restore`,
    method: "put",
  },
  Permanent_delete_user: {
    url: `${serverDomain}/auth/users/:id/permanent`,
    method: "delete",
  },
  Get_deleted_categories: {
    url: `${serverDomain}/categories/deleted`,
    method: "get",
  },
  Restore_category: {
    url: `${serverDomain}/categories/:id/restore`,
    method: "put",
  },
  Permanent_delete_category: {
    url: `${serverDomain}/categories/:id/permanent`,
    method: "delete",
  },
  Get_deleted_products: {
    url: `${serverDomain}/products/deleted`,
    method: "get",
  },
  Restore_product: {
    url: `${serverDomain}/products/:id/restore`,
    method: "put",
  },
  Permanent_delete_product: {
    url: `${serverDomain}/products/:id/permanent`,
    method: "delete",
  },
  Upload_banner: {
    url: `${serverDomain}/banners/upload`,
    method: "post",
  },
  Get_banners: {
    url: `${serverDomain}/banners`,
    method: "get",
  },
  getBannerById: {
    url: `${serverDomain}/banners/:id`,
    method: "get",
  },
  updateBanner: {
    url: `${serverDomain}/banners/:id`,
    method: "put",
  },
  Get_deleted_banners: {
    url: `${serverDomain}/banners/deleted`,
    method: "get",
  },
  Restore_banner: {
    url: `${serverDomain}/banners/:id/restore`,
    method: "put",
  },
  Permanent_delete_banner: {
    url: `${serverDomain}/banners/:id/permanent`,
    method: "delete",
  },
  Get_cart: {
    url: `${serverDomain}/cart/:userId`,
    method: "get",
  },
  Add_to_cart: {
    url: `${serverDomain}/cart`,
    method: "post",
  },
  Remove_from_cart: {
    url: `${serverDomain}/cart/:userId/:productId`,
    method: "delete",
  },
  Update_cart: {
    url: `${serverDomain}/cart/:userId/:productId`,
    method: "put",
  },
};

export default APIEndPoints;