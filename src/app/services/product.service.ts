import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Papa from 'papaparse';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

const PRODUCTS_CACHE_KEY = 'wildtech_products';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8_vceVhE_iFtOwpvbN8oW2B2YsqSFuQoDU5xBEB2Aj2O1WSR4ofcLER03fFJUSiKZBkXA9ERK6xVx/pub?output=csv';
  private products$ = new BehaviorSubject<Product[]>([]);

  constructor(private http: HttpClient) {
    this.loadProductsFromCache();
    this.scheduleRefresh();
  }

  getProducts(): Observable<Product[]> {
    return this.products$.asObservable();
  }

  private fetchProducts() {
    this.http.get(this.csvUrl, { responseType: 'text' }).pipe(
      map(csvData => {
        const parsed = Papa.parse<Product>(csvData, { header: true, skipEmptyLines: true });
        return parsed.data.map(p => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          stock: Number(p.stock)
        }));
      })
    ).subscribe(products => {
      this.products$.next(products);
      this.saveProductsToCache(products);
    });
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
        this.fetchProducts(); // Expirado
      }
    } else {
      this.fetchProducts(); // No hay cache
    }
  }

  private scheduleRefresh() {
    timer(CACHE_TTL, CACHE_TTL).subscribe(() => {
      this.fetchProducts();
    });
  }
}
