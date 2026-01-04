import React from 'react';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import CartItem from '../components/CartItem';

const phone = '584245851434';

const Cart = () => {
  const { items, subtotal, clearCart } = useCart();

  const handlePay = () => {
    if (!items.length) return;
    const lines = items.map(
      i => `${i.qty} x ${i.name} - $${(i.price * i.qty).toFixed(2)}`,
    );
    const message = `Hola, deseo hacer la siguiente compra:%0A%0A${lines.join('%0A')}` +
      `%0A%0ASubtotal: $${subtotal.toFixed(2)}%0A%0ATotal: $${subtotal.toFixed(2)}`;

    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, '_blank');
    clearCart();
  };

  return (
    <div className="pb-14">
      <Header />
      <main className="pt-24 px-4 space-y-4 pb-24">
        {items.length ? (
          items.map(item => <CartItem key={item.id} item={item} />)
        ) : (
          <p className="text-center text-gray-500 mt-10">El carrito está vacío.</p>
        )}
        {items.length > 0 && (
          <div className="sticky bottom-16 bg-white p-4 rounded-card shadow-md">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={handlePay}
              className="mt-3 w-full bg-accent text-white py-2 rounded-card shadow hover:opacity-90 active:scale-95 transition"
            >
              Pagar por WhatsApp
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">Pasos: presiona el botón de pagar y acuerda con el vendedor</p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Cart;
