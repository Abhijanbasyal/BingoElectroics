import APIEndPoints from "../../middleware/APIEndPoints";

const tableConfig = {
  products: {
    endpoint: `${APIEndPoints.Get_products.url}?createdBy=${encodeURIComponent('currentUserId')}`, // Placeholder for dynamic user ID
    deletedEndpoint: `${APIEndPoints.Get_deleted_products.url}?createdBy=${encodeURIComponent('currentUserId')}`, // Placeholder for dynamic user ID
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
    editPath: '/seller/form/edit/product',
    viewPath: '/seller/products',
  },
};

export default tableConfig;