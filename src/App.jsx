import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Favorites from './pages/Favorites';
import Search from './pages/Search';

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<Admin />} />
    <Route path="/favorites" element={<Favorites />} />
    <Route path="/search" element={<Search />} />
  </Routes>
);

export default App;
