// // manageTable.js

// import APIEndPoints from "../../middleware/APIEndPoints";



// const tableConfig = {
//   users: {
//     endpoint: APIEndPoints.Get_Users.url,
//     columns: [
//       { key: 'username', label: 'Username' },
//       { key: 'email', label: 'Email' },
//       { key: 'roles', label: 'Role' },
//       { key: 'points', label: 'Points' },
//       { key: 'pointsRank', label: 'Rank' },
//     ],
//     editPath: '/admin/form/user',
//     viewPath: '/admin/users',
//   },
//   categories: {
//     endpoint: APIEndPoints.Get_category.url,
//     columns: [
//       { key: 'title', label: 'Title' },
//       { key: 'description', label: 'Description' },
//       { key: 'createdBy.username', label: 'Created By' },
//       { key: 'createdDate', label: 'Created Date', format: 'date' },
//     ],
//     editPath: '/admin/form/category',
//     viewPath: '/admin/categories',
//   },
//   products: {
//     endpoint: APIEndPoints.Get_Products.url,
//     columns: [
//       { key: 'title', label: 'Title' },
//       { key: 'description', label: 'Description' },
//       { key: 'price', label: 'Price', format: 'currency' },
//       { key: 'loyaltyPoints', label: 'Loyalty Points' },
//       { key: 'productQuantity', label: 'Quantity' },
//       { key: 'category.title', label: 'Category' },
//       { key: 'createdBy.username', label: 'Created By' },
//       { key: 'createdDate', label: 'Created Date', format: 'date' },
//     ],
//     editPath: '/admin/form/product',
//     viewPath: '/admin/products',
//   },
// };

// export default tableConfig;



import APIEndPoints from "../../middleware/APIEndPoints";

const tableConfig = {
  users: {
    endpoint: APIEndPoints.Get_users.url,
    deletedEndpoint: APIEndPoints.Get_deleted_users.url,
    restoreEndpoint: APIEndPoints.Restore_user.url,
    permanentDeleteEndpoint: APIEndPoints.PermanentDelete_url,
    columns: [
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'roles', label: 'Role' },
      { key: 'points', label: 'Points' },
      { key: 'pointsRank', label: 'Rank' },
    ],
    editPath: '/admin/form/user',
    viewPath: '/admin/users',
  },
  categories: {
    endpoint: APIEndPoints.Get_categories.url,
    deletedEndpoint: APIEndPoints.Get_deleted_categories.url,
    restoreEndpoint: APIEndPoints.Restore_category.url,
    permanentDeleteEndpoint: APIEndPoints.Permanent_delete_category.url,
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      { key: 'createdBy.username', label: 'Created By' },
      { key: 'createdDate', label: 'Created Date', format: 'date' },
    ],
    editPath: '/admin/form/category',
    viewPath: '/admin/categories',
  },
  products: {
    endpoint: APIEndPoints.Get_products.url,
    deletedEndpoint: APIEndPoints.Get_deleted_products.url,
    restoreEndpoint: APIEndPoints.Restore_product.url,
    permanentDeleteEndpoint: APIEndPoints.Permanent_delete_product.url,
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      { key: 'price', label: 'Price', format: 'currency' },
      { key: 'loyaltyPoints', label: 'Loyalty Points' },
      { key: 'productQuantity', label: 'Quantity' },
      { key: 'category.title', label: 'Category' },
      { key: 'createdBy.username', label: 'Created By' },
      { key: 'createdDate', label: 'Created Date', format: 'date' },
    ],
    editPath: '/admin/form/product',
    viewPath: '/admin/products',
  },
};

export default tableConfig;
