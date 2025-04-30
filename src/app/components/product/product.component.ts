import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('1000ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  @Input() product!: Product;
  @Output() viewDetails = new EventEmitter<void>();

  constructor(private cartService: CartService) {}

  generateImageUrl(id: string): string {
    return `https://images.bidcom.com.ar/resize?src=https://static.bidcom.com.ar/publicacionesML/productos/${id}/1000x1000-${id}.jpg&w=500&q=100`;
  }

  addOne() {
    const success = this.cartService.addToCart(this.product);
    if (!success) {
      alert('¡No hay más stock disponible para este producto!');
    }
  }

  removeOne() {
    this.cartService.removeFromCart(this.product);
  }

  getQuantity(): number {
    const cartItem = this.cartService.getCart().find(item => item.product.id === this.product.id);
    return cartItem ? cartItem.quantity : 0;
  }
}
