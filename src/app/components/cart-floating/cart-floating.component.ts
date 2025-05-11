import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Observable, map } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart-floating',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-floating.component.html',
  styleUrls: ['./cart-floating.component.scss'],
})
export class CartFloatingComponent {
  totalItems$: Observable<number>;

  constructor(private cartService: CartService) {
    this.totalItems$ = this.cartService
      .getCartObservable()
      .pipe(
        map((items) => items.reduce((sum, item) => sum + item.quantity, 0))
      );
  }
}
