import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products }) => (
  <div className="grid grid-cols-2 gap-4 px-4 pb-24 mt-4">
    {products.map(p => (
      <ProductCard key={p.id} product={p} />
    ))}
  </div>
);

export default ProductGrid;
