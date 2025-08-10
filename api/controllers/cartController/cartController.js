import Cart from '../../models/cart/cart.js';
  import { errorHandler } from '../../utils/error.js';
  import dotenv from 'dotenv'; 
  import mongoose from 'mongoose';

  dotenv.config();

  export const getCart = async (req, res, next) => {
    try {
      console.log('Fetching cart for userId:', req.params.userId);
      const cart = await Cart.findOne({ userId: req.params.userId }).populate('products.productId', 'title price images productQuantity');
      if (!cart) {
        console.log('No cart found, returning empty cart');
        return res.status(200).json({ success: true, cart: { products: [] } });
      }
      console.log('Cart found with products:', cart.products.map(p => ({
        productId: p.productId?._id,
        productQuantity: p.productId?.productQuantity,
        rawProduct: p.productId
      })));
      res.status(200).json({ success: true, cart });
    } catch (error) {
      console.error('Get cart error at', new Date().toISOString(), ':', error);
      next(error);
    }
  };

  export const addToCart = async (req, res, next) => {
    try {
      const { userId, productId, title, price, image } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw errorHandler(400, 'Invalid userId');
      }
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw errorHandler(400, 'Invalid productId');
      }

      if (!title || !price || !image) {
        throw errorHandler(400, 'Missing required fields: title, price, or image');
      }
      if (price < 0) {
        throw errorHandler(400, 'Price cannot be negative');
      }

      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({ userId, products: [] });
      }

      const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
      if (productIndex > -1) {
        cart.products[productIndex].quantity += 1;
      } else {
        cart.products.push({ productId, title, price, image, quantity: 1 });
      }

      cart.modifiedDate = new Date();
      await cart.save();
      res.status(200).json({ success: true, cart });
    } catch (error) {
      console.error('Add to cart error at', new Date().toISOString(), ':', error);
      next(error);
    }
  };

  export const removeFromCart = async (req, res, next) => {
    try {
      console.log('Removing from cart:', { userId: req.params.userId, productId: req.params.productId });
      const { userId, productId } = req.params;
      const cart = await Cart.findOne({ userId });
      if (!cart) return next(errorHandler(404, 'Cart not found'));

      const initialProductCount = cart.products.length;
      cart.products = cart.products.filter(p => p.productId.toString() !== productId);
      if (cart.products.length === initialProductCount) {
        console.log('No product removed, productId not found:', productId);
        return next(errorHandler(404, 'Product not found in cart'));
      }

      cart.modifiedDate = new Date();
      await cart.save();
      console.log('Cart after removal:', cart.products.length, 'products remaining');
      res.status(200).json({ success: true, cart });
    } catch (error) {
      console.error('Remove from cart error at', new Date().toISOString(), ':', error);
      next(error);
    }
  };

  export const updateCart = async (req, res, next) => {
    try {
      const { userId, productId } = req.params;
      const { quantity } = req.body;
      const cart = await Cart.findOne({ userId });
      if (!cart) return next(errorHandler(404, 'Cart not found'));

      const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
      if (productIndex > -1) {
        cart.products[productIndex].quantity = quantity;
        cart.modifiedDate = new Date();
        await cart.save();
        res.status(200).json({ success: true, cart });
      } else {
        return next(errorHandler(404, 'Product not in cart'));
      }
    } catch (error) {
      next(error);
    }
  };