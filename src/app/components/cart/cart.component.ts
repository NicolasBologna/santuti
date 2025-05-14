import { Component } from '@angular/core';
import { CartItem, CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import {
  formatCurrency,
  calculateDues,
  calculateCartTotal,
  calculateProductPrice,
} from '../../utils/price.util';
import { WHATSAPP_BASE_URL } from '../../app.config';

const CUSTOMER_DATA_KEY = 'wildtech_customer_data';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  cartItems: CartItem[] = [];
  customerData = {
    dni: '',
    name: '',
    address: '',
    phone: '',
  };
  isSending = false;
  formTouched = false;

  selectedDues: {
    [productId: string]: { type: '3' | '6'; amount: number } | null;
  } = {};

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cartService.getCartObservable().subscribe((items) => {
      this.cartItems = items;
    });
    this.loadCustomerData();
  }

  loadCustomerData() {
    const dataStr = localStorage.getItem(CUSTOMER_DATA_KEY);
    if (dataStr) {
      this.customerData = JSON.parse(dataStr);
    }
  }

  saveCustomerData() {
    localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(this.customerData));
  }

  customerDataIsComplete(): boolean {
    return !!(
      this.customerData.dni &&
      this.customerData.name &&
      this.customerData.address &&
      this.customerData.phone
    );
  }

  removeProduct(productId: string) {
    this.cartService.removeProductCompletely(productId);
    this.toastService.show('Producto eliminado del carrito');
  }

  clearCart() {
    this.cartService.clearCart();
    this.toastService.show('Carrito vaciado');
  }

  getDuesLabel(productId: string, unitPrice = false): string {
    const selected = this.selectedDues[productId];
    const quantity = unitPrice
      ? 1
      : this.cartItems.find((c) => c.product.id === productId)?.quantity || 0;

    return calculateDues(selected?.type || null, selected?.amount || null, quantity);
  }

  getTotal(): { totalARS: number; totalUSD: number } {
    return calculateCartTotal(this.cartItems, this.selectedDues);
  }

  sendOrder() {
    this.formTouched = true;

    if (!this.customerDataIsComplete()) {
      this.toastService.show(
        'Por favor completá todos tus datos antes de enviar el pedido.'
      );
      return;
    }

    this.isSending = true;

    setTimeout(() => {
      let message = 'Hola! Quiero estos productos:\n';

      this.cartItems.forEach((item) => {
        const product = item.product;
        const selection = this.selectedDues[product.id];

        message += `- ${product.name} x${item.quantity} - `;

        if (selection?.type === '3') {
          const total = selection.amount * item.quantity * 3;
          message += `3 cuotas de ${formatCurrency(selection.amount)} `;
          message += `(Total: ${formatCurrency(total)})`;
        } else if (selection?.type === '6') {
          const total = selection.amount * item.quantity * 6;
          message += `6 cuotas de ${formatCurrency(selection.amount)} `;
          message += `(Total: ${formatCurrency(total)})`;
        } else {
          const total = calculateProductPrice(product, item.quantity);
          message += `${total} Contado`;
        }

        message += '\n';
      });

      // Agregar totales generales
      const { totalARS, totalUSD } = calculateCartTotal(this.cartItems, this.selectedDues);
      message += `\nTotal en pesos: ${formatCurrency(totalARS, 'ARS')}`;
      if (totalUSD > 0) {
        message += `\nTotal en dólares: ${formatCurrency(totalUSD, 'USD')}`;
      }

      // Agregar datos del cliente
      message += `\n\nDNI: ${this.customerData.dni}`;
      message += `\nNombre y Apellido: ${this.customerData.name}`;
      message += `\nDirección: ${this.customerData.address}`;
      message += `\nTeléfono: ${this.customerData.phone}`;

      // Enviar mensaje por WhatsApp
      const whatsappUrl = `${WHATSAPP_BASE_URL}${encodeURIComponent(
        message
      )}`;

      window.open(whatsappUrl, '_blank');
      this.cartService.clearCart();
      this.isSending = false;
      this.toastService.show('¡Pedido enviado! Carrito vaciado.');
    }, 500);
  }

  productGetPrice(item: CartItem, quantity: number = 1): string {
    return calculateProductPrice(item.product, quantity);
  }
}
