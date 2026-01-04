import React, { createContext, useContext, useEffect, useState } from 'react';

const FavoriteContext = createContext();
const LS_KEY = 'favorites_ids';

export const FavoriteProvider = ({ children }) => {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) setIds(JSON.parse(stored));
  }, []);

  const persist = newIds => {
    setIds(newIds);
    localStorage.setItem(LS_KEY, JSON.stringify(newIds));
  };

  const toggle = id => {
    if (ids.includes(id)) persist(ids.filter(x => x !== id));
    else persist([...ids, id]);
  };

  const value = {
    favoriteIds: ids,
    toggle,
    isFav: id => ids.includes(id),
  };

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
};

export const useFavorites = () => useContext(FavoriteContext);
