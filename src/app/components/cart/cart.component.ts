import { Component } from '@angular/core';
import { CartItem, CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

const CUSTOMER_DATA_KEY = 'wildtech_customer_data';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  cartItems: CartItem[] = [];
  customerData = {
    dni: '',
    name: '',
    address: '',
    phone: ''
  };
  isSending = false;

  constructor(private cartService: CartService, private toastService: ToastService) {}

  ngOnInit() {
    this.cartService.getCartObservable().subscribe(items => {
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

  sendOrder() {
    if (!this.customerDataIsComplete()) {
      alert('Por favor completá tus datos antes de enviar el pedido.');
      return;
    }

    this.isSending = true; // 🔥 Empieza a mostrar el loading

    // Simulamos pequeño delay para UX realista
    setTimeout(() => {
      let message = 'Hola! Quiero estos productos:\n';
      this.cartItems.forEach(item => {
        message += `- ${item.product.name} x${item.quantity} - $${item.product.price * item.quantity}\n`;
      });

      const total = this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      message += `\nTotal: $${total}\n\n`;
      message += `DNI: ${this.customerData.dni}\n`;
      message += `Nombre y Apellido: ${this.customerData.name}\n`;
      message += `Dirección: ${this.customerData.address}\n`;
      message += `Teléfono: ${this.customerData.phone}`;

      const whatsappUrl = `https://wa.me/5493417215835?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, '_blank');
      this.cartService.clearCart(); // ✅ Vacía
      this.isSending = false;
      this.toastService.show('¡Pedido enviado! Carrito vaciado.');
    }, 500); // 0.5 segundos de delay para que se vea suave
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  customerDataIsComplete(): boolean {
    return !!(this.customerData.dni && this.customerData.name && this.customerData.address && this.customerData.phone);
  }

  removeProduct(productId: string) {
    this.cartService.removeProductCompletely(productId);
  }

  clearCart() {
    this.cartService.clearCart();
  }

}
