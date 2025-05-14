import { Product } from '../services/product.service';
import { CartItem } from '../services/cart.service';

/**
 * Formatea un monto como moneda.
 */
export function formatCurrency(
  amount: number,
  currency: 'ARS' | 'USD' = 'ARS',
  locale = 'es-AR'
): string {
  return amount.toLocaleString(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Calcula el precio total de un producto (en pesos o dólares).
 */
export function calculateProductPrice(
  product: Product,
  quantity: number = 1
): string {
  if (product.price_usd) {
    return formatCurrency(product.price_usd * quantity, 'USD');
  }
  if (product.price) {
    return formatCurrency(product.price * quantity, 'ARS');
  }
  return "Consultar precio";
}

/**
 * Calcula las cuotas de un producto.
 */
export function calculateDues(
  duesType: '3' | '6' | null,
  duesAmount: number | null,
  quantity: number
): string {
  if (duesType === '3' && duesAmount) {
    return `3 cuotas de ${formatCurrency(duesAmount * quantity)}`;
  }

  if (duesType === '6' && duesAmount) {
    return `6 cuotas de ${formatCurrency(duesAmount * quantity)}`;
  }

  return '';
}

/**
 * Calcula el total del carrito.
 */
export function calculateCartTotal(
  cartItems: CartItem[],
  selectedDues: { [productId: string]: { type: '3' | '6'; amount: number } | null }
): { totalARS: number; totalUSD: number } {
  let totalARS = 0;
  let totalUSD = 0;

  cartItems.forEach((item) => {
    const product = item.product;
    const quantity = item.quantity;

    if (product.price_usd) {
      // Sumar precios en dólares por separado
      totalUSD += product.price_usd * quantity;
    } else if (product.price) {
      // Calcular el precio en pesos
      const dues = selectedDues[product.id];
      if (dues) {
        // Si hay cuotas seleccionadas, sumar el monto de las cuotas
        totalARS += dues.amount * Number(dues.type) * quantity;
      } else {
        // Si no hay cuotas, sumar el precio normal
        totalARS += product.price * quantity;
      }
    }
  });

  return { totalARS, totalUSD };
}
