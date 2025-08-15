const tableConfig = (userRole) => ({
  users: {
    endpoint: '/api/auth/users',
    deletedEndpoint: '/api/auth/users/deleted',
    restoreEndpoint: '/api/auth/users/restore',
    permanentDeleteEndpoint: '/api/auth/users/permanent',
    editPath: userRole === 'Manager' ? '/manager/form/edit/user' : '/admin/form/edit/user',
    viewPath: userRole === 'Manager' ? '/manager/view/user' : '/admin/view/user',
    columns: [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'roles', label: 'Role' },
    ],
  },
  categories: {
    endpoint: '/api/categories',
    deletedEndpoint: '/api/categories/deleted',
    restoreEndpoint: '/api/categories/restore',
    permanentDeleteEndpoint: '/api/categories/permanent',
    editPath: userRole === 'Manager' ? '/manager/form/edit/category' : '/admin/form/edit/category',
    viewPath: userRole === 'Manager' ? '/manager/view/category' : '/admin/view/category',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
    ],
  },
  products: {
    endpoint: '/api/products',
    deletedEndpoint: '/api/products/deleted',
    restoreEndpoint: '/api/products/restore',
    permanentDeleteEndpoint: '/api/products/permanent',
    editPath: userRole === 'Manager' ? '/manager/form/edit/product' : '/admin/form/edit/product',
    viewPath: userRole === 'Manager' ? '/manager/view/product' : '/admin/view/product',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'price', label: 'Price', format: 'currency' },
      { key: 'category.name', label: 'Category' },
    ],
  },
  banners: {
    endpoint: '/api/banners',
    deletedEndpoint: '/api/banners/deleted',
    restoreEndpoint: '/api/banners/restore',
    permanentDeleteEndpoint: '/api/banners/permanent',
    editPath: userRole === 'Manager' ? '/manager/form/edit/banner' : '/admin/form/edit/banner',
    viewPath: userRole === 'Manager' ? '/manager/view/banner' : '/admin/view/banner',
    columns: [
      { key: 'image', label: 'Image URL', format: 'image' },
      { key: 'link', label: 'Link' },
      { key: 'createdAt', label: 'Created Date', format: 'date' },
    ],
  },
});

export default function getTableConfig(userRole) {
  return tableConfig(userRole || 'Admin');
}