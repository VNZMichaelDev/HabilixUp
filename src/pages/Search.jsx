import React, { useMemo, useState } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../context/ProductContext';

const SearchPage = () => {
  const { products } = useProducts();
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  );

  return (
    <div className="pb-14">
      <Header />
      <main className="pt-20 px-4 pb-24">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full border rounded-card p-2 mb-4 mt-2"
        />
        <ProductGrid products={filtered} />
      </main>
      <BottomNav />
    </div>
  );
};

export default SearchPage;
