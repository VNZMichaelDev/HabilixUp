import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuid } from 'uuid';

const ProductContext = createContext();


// Default seed in case the table is empty
const seedProducts = [
  {
    id: uuid(),
    name: 'Zapatillas Urbanas',
    description: 'Comodidad y estilo para tu día a día',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=60',
    stock: 20,
    category: 'Zapatillas',
  },
  {
    id: uuid(),
    name: 'Remera Básica Blanca',
    description: 'Algodón 100% orgánico',
    price: 15.5,
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=60',
    stock: 50,
    category: 'Remeras',
  },
];

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Supabase fetch error', error);
      }
      if (data && data.length) {
        setProducts(data);
      } else if (data && data.length === 0) {
        // optional: seed initial products once
        await supabase.from('products').insert(seedProducts);
        setProducts(seedProducts);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

    const refresh = async () => {
    const { data } = await supabase.from('products').select('*').order('name');
    if (data) setProducts(data);
  };

    const addProduct = async prod => {
    await supabase.from('products').insert([{ ...prod }]);
    await refresh();
  };

    const updateProduct = async (id, data) => {
    await supabase.from('products').update(data).eq('id', id);
    await refresh();
  };

    const deleteProduct = async id => {
    await supabase.from('products').delete().eq('id', id);
    await refresh();
  };

    const value = {
    loading,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => useContext(ProductContext);
