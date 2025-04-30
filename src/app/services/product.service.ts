import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as Papa from 'papaparse';
import { CartService } from './cart.service';
import { ToastService } from './toast.service';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
}

const PRODUCTS_CACHE_KEY = 'wildtech_products';
const CACHE_TTL = 3 * 60 * 1000;
const timestamp = new Date().getTime();

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8_vceVhE_iFtOwpvbN8oW2B2YsqSFuQoDU5xBEB2Aj2O1WSR4ofcLER03fFJUSiKZBkXA9ERK6xVx/pub?output=csv';
  private products$ = new BehaviorSubject<Product[]>([]);
  private isFetching = false;
  private urlWithTimestamp = `${this.csvUrl}&t=${timestamp}`;

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private toastService: ToastService
  ) {
    this.loadProductsFromCache();
    this.scheduleRefresh();
  }

  getProducts(): Observable<Product[]> {
    return this.products$.asObservable();
  }

  private fetchProducts() {
    if (this.isFetching) return;

    this.isFetching = true;

    this.http.get(this.urlWithTimestamp, { responseType: 'text' }).pipe(
      map(csvData => {
        const parsed = Papa.parse<Product>(csvData, { header: true, skipEmptyLines: true });
        return parsed.data.map(p => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          stock: Number(p.stock),
          category: p.category,
          description: p.description || ''
        }));
      }),
      catchError(error => {
        console.error('Error fetching products', error);
        this.isFetching = false;
        return of([]); // Previene que el stream explote
      })
    ).subscribe(products => {
      if (products.length > 0 && this.isDifferent(products)) {
        this.products$.next(products);
        this.saveProductsToCache(products);
        this.cartService.syncCartWithProducts(products);
        this.toastService.show('¡Productos actualizados!');
      }
      this.isFetching = false;
    });
  }

  private isDifferent(newProducts: Product[]): boolean {
    const currentProducts = this.products$.value;

    if (currentProducts.length !== newProducts.length) return true;

    for (let i = 0; i < newProducts.length; i++) {
      const newP = newProducts[i];
      const currentP = currentProducts.find(p => p.id === newP.id);

      if (!currentP ||
          currentP.price !== newP.price ||
          currentP.stock !== newP.stock ||
          currentP.name !== newP.name) {
        return true;
      }
    }

    return false;
  }

  private saveProductsToCache(products: Product[]) {
    const cache = {
      timestamp: Date.now(),
      products: products
    };
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(cache));
  }

  private loadProductsFromCache() {
    const cacheStr = localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (cacheStr) {
      const cache = JSON.parse(cacheStr);
      const now = Date.now();
      if (now - cache.timestamp < CACHE_TTL) {
        this.products$.next(cache.products);
      } else {
        this.fetchProducts();
      }
    } else {
      this.fetchProducts();
    }
  }

  private scheduleRefresh() {
    timer(CACHE_TTL, CACHE_TTL)
      .pipe(
        switchMap(() => {
          this.fetchProducts();
          return of([]);
        })
      )
      .subscribe();
  }
}
