import React from 'react';
import { Minus, Plus, Trash } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQty, removeFromCart } = useCart();

  return (
    <div className="flex gap-3 items-center bg-white rounded-card shadow p-3">
      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">{item.name}</h4>
        <p className="text-xs text-gray-500 line-clamp-1">${item.price.toFixed(2)} c/u</p>
        <div className="flex items-center gap-2 mt-1">
          <button type="button" onClick={() => updateQty(item.id, item.qty - 1)} className="p-1 rounded-full bg-gray-100">
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-6 text-center text-sm">{item.qty}</span>
          <button type="button" onClick={() => updateQty(item.id, item.qty + 1)} className="p-1 rounded-full bg-gray-100">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end h-full justify-between">
        <span className="font-bold text-primary">${(item.price * item.qty).toFixed(2)}</span>
        <button type="button" onClick={() => removeFromCart(item.id)} className="text-red-500">
          <Trash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
