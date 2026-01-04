import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetailModal = ({ product, open, onClose }) => {
  const images = [product.image, product.image2].filter(Boolean);
  const [idx, setIdx] = useState(0);
  const { addToCart } = useCart();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
      <div className="bg-white w-11/12 max-w-md max-h-[80vh] overflow-y-auto rounded-card p-4 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500"
        >
          <X className="w-6 h-6" />
        </button>
        <img src={images[idx]} alt={product.name} className="w-full h-48 object-contain mb-3" />
        {images.length > 1 && (
          <div className="flex gap-2 mb-3 justify-center">
            {images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt="thumb"
                onClick={() => setIdx(i)}
                className={`w-12 h-12 object-cover rounded-md border ${i === idx ? 'border-primary' : 'border-transparent'}`}
              />
            ))}
          </div>
        )}
        <h3 className="font-bold text-lg mb-1 text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-primary font-bold text-xl">${product.price.toFixed(2)}</span>
          <button
            type="button"
            onClick={() => {
              addToCart(product);
              onClose();
            }}
            className="bg-primary text-white px-4 py-2 rounded-card shadow hover:bg-primary-dark active:scale-95 transition"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
