import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ProductComponent } from '../product/product.component';
import { ToastService } from '../../services/toast.service';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { ProductModalComponent } from '../product-modal/product-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ProductComponent, ProductModalComponent],
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query('app-product', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(100, [
            animate('2500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  selectedCategory: string = 'Todas';
  categories: string[] = [];
  selectedProduct: Product | null = null;

  constructor(private productService: ProductService) {}
  ngOnInit() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
      this.categories = ['Todas', ...new Set(data.map(p => p.category))];
    });
  }

  filteredProducts(): Product[] {
    if (this.selectedCategory === 'Todas') return this.products;
    return this.products.filter(p => p.category === this.selectedCategory);
  }

  openProductModal(product: Product) {
    this.selectedProduct = product;
    document.body.style.overflow = 'hidden'; // 🔒 desactiva scroll del body
  }

  closeProductModal() {
    this.selectedProduct = null;
    document.body.style.overflow = 'auto'; // 🔓 reactiva scroll
  }
  
}
