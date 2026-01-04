import React, { useMemo } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../context/ProductContext';
import { useFavorites } from '../context/FavoriteContext';

const Favorites = () => {
  const { products } = useProducts();
  const { favoriteIds } = useFavorites();
  const favProducts = useMemo(() => products.filter(p => favoriteIds.includes(p.id)), [products, favoriteIds]);

  return (
    <div className="pb-14">
      <Header />
      <main className="pt-20 pb-24">
        {favProducts.length ? (
          <ProductGrid products={favProducts} />
        ) : (
          <p className="text-center text-gray-500 mt-10">Aún no hay favoritos.</p>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Favorites;
