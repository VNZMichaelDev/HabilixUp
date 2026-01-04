import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ProductDetailModal from './ProductDetailModal';
import { Heart } from 'lucide-react';
import { useFavorites } from '../context/FavoriteContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggle, isFav } = useFavorites();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="relative bg-white rounded-card shadow-md overflow-hidden flex flex-col"
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={() => setOpen(true)}
      >
                <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            toggle(product.id);
          }}
          className="absolute top-2 right-2 z-10"
        >
          <Heart className={`w-5 h-5 ${isFav(product.id) ? 'fill-primary text-primary' : 'text-gray-300'}`} />
        </button>
        <img src={product.image} alt={product.name} className="h-40 md:h-48 w-full object-contain p-2" />
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 flex-1">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-primary font-bold">${product.price.toFixed(2)}</span>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="bg-primary text-white p-1 rounded-full shadow-md hover:bg-primary-dark active:scale-90 transition"
            aria-label="Agregar al carrito"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
          </div>
      <ProductDetailModal product={product} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default ProductCard;
