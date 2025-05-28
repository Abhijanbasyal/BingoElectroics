

import APIEndPoints from '../../middleware/APIEndPoints';

export const getFormConfig = (type, id) => {
  const baseConfig = {
    category: {
      fields: [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", required: true },
      ],
      endpoint: `${APIEndPoints.Get_categories.url}/${id}`,
      updateEndpoint: `${APIEndPoints.Get_categories.url}/${id}`,
      title: "Edit Category",
    },
    user: {
      fields: [
        { name: "username", label: "Username", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "password", label: "Password", type: "password", required: false, placeholder: "Leave blank to keep unchanged" },
        {
          name: "roles",
          label: "Role",
          type: "select",
          options: ["Customer", "Seller", "Manager", "Admin"],
          required: true,
        },
        { name: "points", label: "Points", type: "number", required: false },
      ],
      endpoint: `${APIEndPoints.Get_users.url}/${id}`,
      updateEndpoint: `${APIEndPoints.Get_users.url}/${id}`,
      title: "Edit User",
    },
    product: {
      fields: [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", required: true },
        { name: "price", label: "Price", type: "number", required: true, step: "0.01" },
        { name: "loyaltyPoints", label: "Loyalty Points", type: "number", required: true },
        { name: "productQuantity", label: "Quantity", type: "number", required: true },
        {
          name: "category",
          label: "Category",
          type: "select",
          options: [], // Will be populated in EditForm.jsx
          required: true,
        },
        { name: "images", label: "Images", type: "file", multiple: true, accept: "image/*" },
      ],
      endpoint: `${APIEndPoints.Get_products.url}/${id}`,
      updateEndpoint: `${APIEndPoints.Get_products.url}/${id}`,
      title: "Edit Product",
    },
  };

  return baseConfig[type] || {};
};