import { Injectable } from '@angular/core';
import { Product } from './product.service';

const CART_STORAGE_KEY = 'wildtech_cart';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: CartItem[] = [];

  constructor() {
    this.loadCart();
  }

  addToCart(product: Product): boolean {
    const existingItem = this.cart.find(item => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
        this.saveCart();
        return true;
      } else {
        return false; // No agregar más que el stock disponible
      }
    } else {
      if (product.stock > 0) {
        this.cart.push({ product, quantity: 1 });
        this.saveCart();
        return true;
      } else {
        return false; // Stock 0, no podemos agregar
      }
    }
  }

  getCart(): CartItem[] {
    return this.cart;
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  private saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
  }

  private loadCart() {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
  }
}
