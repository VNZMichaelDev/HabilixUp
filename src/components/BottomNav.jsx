import React from 'react';
import { Home, ShoppingCart, Heart, Search } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  const linkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center flex-1 py-1 ${isActive ? 'text-primary' : 'text-gray-400'}`;

  return (
      <nav className="fixed bottom-0 inset-x-0 bg-white shadow-inner h-14 flex z-20">
      <NavLink to="/" className={linkClass}>
        <Home className="w-5 h-5" />
        <span className="text-xs">Inicio</span>
      </NavLink>
            <NavLink to="/cart" className={linkClass}>
        <ShoppingCart className="w-5 h-5" />
        <span className="text-xs">Carrito</span>
      </NavLink>
            <NavLink to="/favorites" className={linkClass}>
        <Heart className="w-5 h-5" />
        <span className="text-xs">Favs</span>
      </NavLink>
      <NavLink to="/search" className={linkClass}>
        <Search className="w-5 h-5" />
        <span className="text-xs">Buscar</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
