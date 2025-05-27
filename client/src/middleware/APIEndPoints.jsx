

const serverDomain = process.env.REACT_APP_SERVER_DOMAIN;

const APIEndPoints = {
  signUp: {
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
  Add_category: {
    url: `${serverDomain}/categories`,
    method: "post",
  },
  Get_categories: {
    url: `${serverDomain}/categories`,
    method: "get",
  },
  Add_product: {
    url: `${serverDomain}/products`,
    method: "post",
  },
  Get_users: {
    url: `${serverDomain}/auth/users`,
    method: "get",
  },
  Get_products: {
    url: `${serverDomain}/products`,
    method: "get",
  },
  Get_deleted_users: {
    url: `${serverDomain}/auth/users/deleted`,
    method: "get",
  },
  Restore_user: {
    url: `${serverDomain}/auth/users`, // Base URL, append /:id/restore
    method: "put",
  },
  Permanent_delete_user: {
    url: `${serverDomain}/auth/users`, // Base URL, append /:id/permanent
    method: "delete",
  },
  Get_deleted_categories: {
    url: `${serverDomain}/categories/deleted`,
    method: "get",
  },
  Restore_category: {
    url: `${serverDomain}/categories`, // Base URL, append /:id/restore
    method: "put",
  },
  Permanent_delete_category: {
    url: `${serverDomain}/categories`, // Base URL, append /:id/permanent
    method: "delete",
  },
  Get_deleted_products: {
    url: `${serverDomain}/products/deleted`,
    method: "get",
  },
  Restore_product: {
    url: `${serverDomain}/products`, // Base URL, append /:id/restore
    method: "put",
  },
  Permanent_delete_product: {
    url: `${serverDomain}/products`, // Base URL, append /:id/permanent
    method: "delete",
  },
};

export default APIEndPoints;
