import { Injectable } from '@angular/core';
import { Product } from './product.service';
import { ToastService } from './toast.service';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private cartSubject = new BehaviorSubject<CartItem[]>(this.cart);


  constructor(private toastService: ToastService) {
    this.loadCart();
  }

  getCartObservable(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  addToCart(product: Product): boolean {
    const existingItem = this.cart.find(item => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
        this.cartSubject.next(this.cart);
        this.saveCart();
        return true;
      } else {
        return false; // No agregar más que el stock disponible
      }
    } else {
      if (product.stock > 0) {
        this.cart.push({ product, quantity: 1 });
        this.cartSubject.next(this.cart);
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
    this.cartSubject.next(this.cart);
    this.saveCart();
  }

  removeFromCart(product: Product) {
    const existingItem = this.cart.find(item => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity > 1) {
        existingItem.quantity--;
      } else {
        // Si queda solo 1, al restar, eliminamos el item del carrito
        this.cart = this.cart.filter(item => item.product.id !== product.id);
      }
      this.cartSubject.next(this.cart);
      this.saveCart();
    }
  }

  syncCartWithProducts(productsFromSheet: Product[]) {
    this.cart = this.cart.filter(item => {
      const updatedProduct = productsFromSheet.find(p => p.id === item.product.id);

      if (!updatedProduct) {
        // Producto eliminado de Google Sheets
        this.toastService.show('Actualizamos tu carrito según el stock disponible.');
        return false;
      }

      if (item.quantity > updatedProduct.stock) {
        // Stock actual menor al que el cliente había pedido
        item.quantity = updatedProduct.stock;
        this.toastService.show('Actualizamos tu carrito según el stock disponible.');

      }

      // Actualizar datos del producto (nombre, precio, stock)
      item.product = updatedProduct;

      return true; // Mantener en el carrito
    });

    this.saveCart();
  }

  private saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
  }

  private loadCart() {
    const savedCart = localStorage.getItem('wildtech_cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    } else {
      this.cart = [];
    }
    this.cartSubject.next(this.cart);
  }
}
