import React, { useState } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import PasswordModal from '../components/PasswordModal';
import { PlusCircle, Pencil, Trash } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ProductFormModal from '../components/ProductFormModal';
import { useProducts } from '../context/ProductContext';

const Admin = () => {
  const { authorized, login, loading: authLoading, error: authError } = useAdminAuth();
  const [auth, setAuth] = useState(authorized);
  const { products, deleteProduct, loading } = useProducts();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = prod => {
    setEditing(prod);
    setOpen(true);
  };

  if (!auth)
    return (
      <PasswordModal
        loading={authLoading}
        error={authError}
        onSubmit={async pwd => {
          const ok = await login(pwd);
          if (ok) setAuth(true);
        }}
      />
    );

  return (
    <div className="pb-14">
      <Header />
      <main className="pt-14 px-4 pb-24 space-y-4">
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-card shadow w-full justify-center"
        >
          <PlusCircle className="w-5 h-5" /> Agregar producto
        </button>
        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : (
          <div className="space-y-3">
            {products.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-card shadow p-3 flex items-center gap-3"
              >
                <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-md" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold line-clamp-1">{p.name}</p>
                  <p className="text-gray-500 line-clamp-1">Stock: {p.stock}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="text-primary p-1"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteProduct(p.id)}
                  className="text-red-500 p-1"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
      <ProductFormModal open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  );
};

export default Admin;
