import Cart from '../../models/cart/cart.js';
import { errorHandler } from '../../utils/error.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('products.productId', 'title price images');
    if (!cart) {
      return res.status(200).json({ success: true, cart: { products: [] } });
    }
    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { userId, productId, title, price, image } = req.body;
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
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { userId, productId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return next(errorHandler(404, 'Cart not found'));

    cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    cart.modifiedDate = new Date();
    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (error) {
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