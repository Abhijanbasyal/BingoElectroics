import APIEndPoints from '../../middleware/APIEndPoints';

export const getFormConfig = (type, id) => {
  const baseConfig = {
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
      endpoint: `${APIEndPoints.Get_products.url}/${id}?createdBy=${encodeURIComponent('currentUserId')}`, // Placeholder for dynamic user ID
      updateEndpoint: `${APIEndPoints.Get_products.url}/${id}`,
      title: "Edit Product",
    },
  };

  return baseConfig[type] || {};
};