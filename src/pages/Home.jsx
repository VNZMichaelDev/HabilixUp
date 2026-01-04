import React, { useMemo, useState } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import BannerCarousel from '../components/BannerCarousel';
import CategoryChips from '../components/CategoryChips';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../context/ProductContext';

const Home = () => {
  const { products, loading } = useProducts();
  const [category, setCategory] = useState(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category))).sort(),
    [products],
  );

  const filtered = useMemo(
    () => (category ? products.filter(p => p.category === category) : products),
    [products, category],
  );

  return (
    <div className="pb-14">{/* ensure space for bottom nav */}
      <Header />
      <main className="pt-20">{/* offset for fixed header */}
        <BannerCarousel />
        <CategoryChips categories={categories} selected={category} onSelect={setCategory} />
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Cargando...</p>
        ) : (
          <ProductGrid products={filtered} />
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Home;
