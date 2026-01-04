import React from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

const SideDrawer = ({ open, onClose }) => {
  return (
    <div
      className={`fixed inset-0 z-30 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        role="presentation"
        onClick={onClose}
      />
      {/* panel */}
      <aside
        className={`absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg">Menú</h2>
          <button type="button" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col p-4 gap-3 text-primary font-medium">
          <Link to="/" onClick={onClose}>Inicio</Link>
          <Link to="/cart" onClick={onClose}>Carrito</Link>
          <Link to="/admin" onClick={onClose}>Administrar productos</Link>
          <Link to="/favorites" onClick={onClose}>Favoritos</Link>
          <Link to="/search" onClick={onClose}>Buscar</Link>
        </nav>
      </aside>
    </div>
  );
};

export default SideDrawer;
