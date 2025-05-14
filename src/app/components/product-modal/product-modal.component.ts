import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { formatCurrency, calculateProductPrice } from '../../utils/price.util';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
  animations: [
    trigger('modalAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.92)' }),
        animate('320ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '380ms ease-in',
          style({ opacity: 0, transform: 'scale(0.92)' })
        ),
      ]),
    ]),
  ],
})
export class ProductModalComponent {
  @Input() product!: Product;
  @Output() close = new EventEmitter<void>();
  show = true;

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  generateImageUrl(id: string): string {
    return `assets/product-images/${id}.jpg`;
  }

  addToCartAndClose() {
    const success = this.cartService.addToCart(this.product);
    if (!success) {
      this.toastService.show('No hay stock suficiente');
    } else {
      this.closeWithAnimation(); // activa la animación
    }
  }

  closeWithAnimation() {
    this.show = false;
  }

  onAnimationDone(event: any) {
    if (event.toState === 'hidden') {
      this.close.emit(); // Esto borra el componente del DOM
    }
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/product-images/no-image.jpg';
    target.classList.add('no-image'); // 👈 agregamos clase extra
  }

  productGetPrice(product: Product, quantity: number = 1): string {
    return calculateProductPrice(product, quantity);
  }
}
