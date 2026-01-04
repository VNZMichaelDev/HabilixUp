import React, { useState } from 'react';
import { Menu, Heart, Search } from 'lucide-react';
import SideDrawer from './SideDrawer';
import { Link } from 'react-router-dom';

const Header = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
  <header className="flex items-center justify-between px-4 bg-white shadow-md fixed top-0 inset-x-0 z-20 h-16">
    <button type="button" onClick={() => setOpen(true)}>
      <Menu className="w-6 h-6 text-primary" />
    </button>
    <div className="flex items-center">
      <img src="https://i.postimg.cc/CKd8tSDN/Logo.png" alt="HabilixUp logo" className="h-10 md:h-14 w-auto" />
    </div>
    <div className="flex gap-4">
      <Link to="/favorites">
        <Heart className="w-6 h-6 text-primary" />
      </Link>
      <Link to="/search">
        <Search className="w-6 h-6 text-primary" />
      </Link>
    </div>
  </header>
    <SideDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default Header;
