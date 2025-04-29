import { Component } from '@angular/core';
import { CartItem, CartService } from '../../services/cart.service';
import { Product } from '../../services/product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  cartItems: CartItem[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartItems = this.cartService.getCart();
  }

  sendOrder() {
    if (this.cartItems.length === 0) {
      alert('¡Tu carrito está vacío! Agregá productos para hacer un pedido.');
      return;
    }

    let message = 'Hola! Quiero estos productos:\n';
    this.cartItems.forEach(item => {
      message += `- ${item.product.name} x${item.quantity} - $${item.product.price * item.quantity}\n`;
    });

    const total = this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    message += `\nTotal: $${total}`;

    const whatsappUrl = `https://wa.me/5493417215835?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }
}
