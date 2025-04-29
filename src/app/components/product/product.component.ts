import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/product.service'; // adaptá la ruta si es necesario

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  @Input() product!: Product;  // <-- El producto llega como input
  @Input() addToCart!: (product: Product) => void; // <-- Recibimos también la función para agregar

  generateImageUrl(id: string): string {
    return `https://images.bidcom.com.ar/resize?src=https://static.bidcom.com.ar/publicacionesML/productos/${id}/1000x1000-${id}.jpg&w=500&q=100`;
  }

}
