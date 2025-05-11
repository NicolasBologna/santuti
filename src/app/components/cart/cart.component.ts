import { Component } from '@angular/core';
import { CartItem, CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

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

    let quantity;
    if (unitPrice) {
      quantity = 1;
    } else {
      quantity =
        this.cartItems.find((c) => c.product.id == productId)?.quantity || 0;
    }

    if (selected?.type === '3') {
      return `3 cuotas de ${this.formatCurrency(selected.amount * quantity)}`;
    }

    if (selected?.type === '6') {
      return `6 cuotas de ${this.formatCurrency(selected.amount * quantity)}`;
    }

    return '';
  }

  private formatCurrency(amount: number): string {
    return amount.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => {
      const selected = this.selectedDues[item.product.id];
      const product = item.product;

      if (selected?.type === '3') {
        return sum + selected.amount * item.quantity * 3;
      }

      if (selected?.type === '6') {
        return sum + selected.amount * item.quantity * 6;
      }

      return sum + product.price * item.quantity;
    }, 0);
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
          message += `3 cuotas de ${selection.amount.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
          })} `;
          message += `(Total: ${total.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
          })})`;
        } else if (selection?.type === '6') {
          const total = selection.amount * item.quantity * 6;
          message += `6 cuotas de ${selection.amount.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
          })} `;
          message += `(Total: ${total.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
          })})`;
        } else {
          const total = this.productGetPrice(item, item.quantity);
          message += `${total} Contado`;
        }

        message += '\n';
      });

      message += `DNI: ${this.customerData.dni}\n`;
      message += `Nombre y Apellido: ${this.customerData.name}\n`;
      message += `Dirección: ${this.customerData.address}\n`;
      message += `Teléfono: ${this.customerData.phone}`;

      const whatsappUrl = `https://wa.me/5493417215835?text=${encodeURIComponent(
        message
      )}`;

      window.open(whatsappUrl, '_blank');
      this.cartService.clearCart();
      this.isSending = false;
      this.toastService.show('¡Pedido enviado! Carrito vaciado.');
    }, 500);
  }

  productGetPrice(item: CartItem, quantity: number = 1): string {
    if (item.product.price_usd) {
      return 'USD ' + item.product.price_usd * quantity;
    }
    return '$ ' + item.product.price * quantity;
  }
}
